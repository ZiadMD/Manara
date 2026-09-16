import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { AdminMetricsResponse, SafetyConfig } from '../../types';
import { request } from '../../api/client';
import { ScreeningBadge } from '../common/Badge';
import {
  ShieldCheck,
  BarChart3,
  Users,
  Settings2,
  RefreshCw,
  Lock,
  CheckCircle,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const [metrics, setMetrics] = useState<AdminMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Config editor state
  const [configItemsStr, setConfigItemsStr] = useState<string>('');
  const [configThreshold, setConfigThreshold] = useState<number>(4);
  const [configSaveSuccess, setConfigSaveSuccess] = useState<boolean>(false);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [metricsData, configData] = await Promise.all([
        request<AdminMetricsResponse>('/admin/metrics'),
        request<SafetyConfig>('/admin/safety-config'),
      ]);
      setMetrics(metricsData);
      setConfigItemsStr(configData.direct_risk_items.join(', '));
      setConfigThreshold(configData.trigger_threshold);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load admin metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigSaveSuccess(false);
    try {
      const parsedItems = configItemsStr
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 1 && n <= 61);

      const updated = await request<SafetyConfig>('/admin/safety-config', {
        method: 'PUT',
        body: JSON.stringify({
          direct_risk_items: parsedItems,
          trigger_threshold: configThreshold,
        }),
      });
      setConfigItemsStr(updated.direct_risk_items.join(', '));
      setConfigThreshold(updated.trigger_threshold);
      setConfigSaveSuccess(true);
      setTimeout(() => setConfigSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update safety config');
    } finally {
      setIsSavingConfig(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>{t('جارٍ تحميل مؤشرات وإحصاءات النظام...', 'Loading system aggregate metrics...')}</p>
      </div>
    );
  }

  const domainsList = ['anxiety', 'depression', 'behavior', 'self_harm', 'school_maladjustment'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Title & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t('لوحة الإدارة والإحصاءات المجمعة', 'Admin Aggregate Analytics')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t(
              'بيانات مجمعة منزوعة الهوية لمتابعة اتجاهات الفرز وإدارة معايير السلامة.',
              'De-identified aggregate statistics and safety configuration administration.'
            )}
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('تحديث', 'Refresh')}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Strict Privacy Assurance Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              <span>{t('ضمان الخصوصية وحماية بيانات القُصّر', 'Privacy & Data Protection Assurance')}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                {t('مفعل برمجياً', 'Enforced by Design')}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {t(
                'وفقًا للمواصفة القياسية: تقتصر صلاحية الإدارة على المؤشرات الإحصائية المجمعة دون أي وصول إلى بيانات الطلاب النفسية الفردية.',
                'Admin access is strictly restricted to de-identified aggregate metrics. Individual psychological records are restricted to qualified counselors.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">{t('إجمالي التقييمات', 'Total Assessments')}</span>
              <FileCheck2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {metrics.total_assessments}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {t('تقييمات مكتملة ومسجلة في النظام', 'Submitted screening assessments')}
            </span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">{t('مؤشرات السلامة المرصودة', 'Total Safety Flags')}</span>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {metrics.total_safety_flags}
            </div>
            <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
              {metrics.open_safety_flags} {t('قيد المتابعة والتدخل حاليًا', 'active open flags')}
            </span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">{t('توزيع المرحلة الدراسية', 'School Stages')}</span>
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex items-center gap-4 text-sm font-bold text-slate-800 mt-2">
              <div>
                <span className="text-slate-500 font-normal text-xs block">{t('المرحلة المتوسطة', 'Middle School')}</span>
                <span className="text-xl font-mono">{metrics.demographics.by_stage.middle || 0}</span>
              </div>
              <div className="h-8 border-s border-slate-200" />
              <div>
                <span className="text-slate-500 font-normal text-xs block">{t('المرحلة الثانوية', 'High School')}</span>
                <span className="text-xl font-mono">{metrics.demographics.by_stage.high || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Domain Screening Level Distributions */}
      {metrics && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>{t('توزيع مستويات الفرز حسب المجالات النفسية الخمسة', 'Screening Level Distribution by Domain')}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'نسب الحالات عبر مستويات الفرز الأربعة: منخفض (<60)، متوسط (60-65)، مرتفع (65-70)، مرتفع جداً (≥70).',
                  'Distribution across 4 screening levels: Low (<60), Medium (60-65), High (65-70), Very High (>=70).'
                )}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {domainsList.map((domKey) => {
              const domData = metrics.domains[domKey];
              if (!domData) return null;

              const levels = ['low', 'medium', 'high', 'very_high'];
              const levelColors: Record<string, string> = {
                low: 'bg-emerald-500',
                medium: 'bg-amber-500',
                high: 'bg-orange-500',
                very_high: 'bg-rose-600',
              };

              return (
                <div key={domKey} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">
                        {language === 'ar' ? domData.domain_name_ar : domData.domain_name_en}
                      </span>
                      {domData.mean_t_score !== null && (
                        <span className="text-xs text-slate-400 ms-2 font-mono">
                          {t('متوسط الدرجة التائية:', 'Mean T:')} {domData.mean_t_score}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Multi-segment Progress Bar */}
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex mb-3">
                    {levels.map((lvl) => {
                      const item = domData.levels[lvl];
                      const pct = item ? item.percentage : 0;
                      if (pct <= 0) return null;
                      return (
                        <div
                          key={lvl}
                          style={{ width: `${pct}%` }}
                          className={`${levelColors[lvl]} h-full transition-all`}
                          title={`${lvl}: ${pct}%`}
                        />
                      );
                    })}
                  </div>

                  {/* Level Numbers */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {levels.map((lvl) => {
                      const item = domData.levels[lvl];
                      return (
                        <div key={lvl} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                          <ScreeningBadge level={lvl} size="sm" />
                          <span className="font-mono font-bold text-slate-700">
                            {item?.count || 0} ({item?.percentage || 0}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Safety Override Dynamic Configuration Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {t('تكوين قاعدة تجاوز السلامة (مجال إيذاء الذات)', 'Safety Override Dynamic Configuration')}
            </h2>
            <p className="text-xs text-slate-500">
              {t(
                'تعديل بنود الخطر المباشر وحد العتبة دون تعديل في الكود البرمجي (بناءً على البند 8 في المواصفة القياسية).',
                'Configure direct-risk candidate items and trigger threshold without code changes (Section 8).'
              )}
            </p>
          </div>
        </div>

        {configSaveSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{t('تم حفظ التعديلات وتحديث قواعد السلامة بنجاح.', 'Safety configuration saved successfully.')}</span>
          </div>
        )}

        <form onSubmit={handleSaveConfig} className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {t('أرقام بنود الخطر المباشر (مفصولة بفواصل)', 'Direct-Risk Candidate Items (comma-separated)')}
            </label>
            <input
              type="text"
              value={configItemsStr}
              onChange={(e) => setConfigItemsStr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
              placeholder="42, 43, 45, 46, 48, 49"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              {t(
                'البنود المقترحة: 42 (أفكار إيذاء النفس)، 43 (عدم الرغبة في الاستمرار)، 45 (الاختفاء)، 46 (إيذاء النفس العمد)، 48، 49.',
                'Candidate items: 42 (thoughts of self-harm), 43 (wish not to continue living), 45 (disappearing), 46 (deliberate harm), 48, 49.'
              )}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {t('حد عتبة الاستجابة لتفعيل التنبيه (Threshold)', 'Triggering Response Threshold')}
            </label>
            <select
              value={configThreshold}
              onChange={(e) => setConfigThreshold(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value={3}>{t('3 أو أكثر (أحيانًا، كثيرًا، دائمًا)', '3 or higher (Sometimes, Often, Always)')}</option>
              <option value={4}>{t('4 أو أكثر (كثيرًا، دائمًا) — القيمة الافتراضية', '4 or higher (Often, Always) — Default')}</option>
              <option value={5}>{t('5 فقط (دائمًا)', '5 only (Always)')}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSavingConfig}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSavingConfig ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ التعديلات', 'Save Changes')}</span>
          </button>
        </form>
      </div>

    </div>
  );
};
