import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { AssessmentDetail, SafetyFlag } from '../../types';
import { request } from '../../api/client';
import { ScreeningBadge, SafetyStatusBadge } from '../common/Badge';
import { SafetyFlagModal } from './SafetyFlagModal';
import {
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  User,
  Calendar,
  Layers,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface StudentProfileReportProps {
  assessmentId: string;
  onBack: () => void;
}

export const StudentProfileReport: React.FC<StudentProfileReportProps> = ({
  assessmentId,
  onBack,
}) => {
  const { language, isRtl, t } = useLanguage();
  const [detail, setDetail] = useState<AssessmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlagForEdit, setSelectedFlagForEdit] = useState<SafetyFlag | null>(null);

  const ArrowBack = isRtl ? ArrowRight : ArrowLeft;

  const loadDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await request<AssessmentDetail>(`/assessments/${assessmentId}`);
      setDetail(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assessment report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [assessmentId]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>{t('جارٍ تحميل تقرير الطالب...', 'Loading student report...')}</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-8 max-w-xl mx-auto bg-white rounded-2xl border border-rose-200 text-center">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {t('تعذر تحميل التقرير', 'Unable to load report')}
        </h3>
        <p className="text-sm text-slate-600 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
        >
          {t('العودة للقائمة', 'Back to list')}
        </button>
      </div>
    );
  }

  const domainsOrder = ['anxiety', 'depression', 'behavior', 'self_harm', 'school_maladjustment'];
  const scaleLabels: Record<number, { ar: string; en: string }> = {
    1: { ar: 'أبدًا (1)', en: 'Never (1)' },
    2: { ar: 'نادرًا (2)', en: 'Rarely (2)' },
    3: { ar: 'أحيانًا (3)', en: 'Sometimes (3)' },
    4: { ar: 'كثيرًا (4)', en: 'Often (4)' },
    5: { ar: 'دائمًا (5)', en: 'Always (5)' },
  };

  return (
    <div className="workspace-page space-y-6">
      
      {/* Header bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors cursor-pointer"
            title={t('العودة', 'Back')}
          >
            <ArrowBack className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {t('تقرير التقييم النفسي الفردي', 'Individual Psychological Screening Profile')}
              </h1>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-mono font-medium">
                {detail.id.slice(0, 8)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <User className="w-3.5 h-3.5 text-blue-600" />
                {detail.student_name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(detail.submitted_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
              </span>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div>
          {detail.safety_flags.length > 0 ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>{t('يوجد مؤشر أولوية / سلامة', 'Special Priority Safety Flag')}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('لا يوجد تنبيه سلامة آلي', 'No automated safety flag')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Safety flags alert callout if present */}
      {detail.safety_flags.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-900">
                  {t('تنبيه سلامة ذو أولوية خاصة (مجال إيذاء الذات)', 'High-Priority Safety Flag (Self-Harm Override)')}
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  {t(
                    'تم تفعيل هذا التنبيه آليًا ومستقلاً عن درجة (T) بناءً على قاعدة التجاوز لبنود الخطر المباشر.',
                    'Triggered independently of T-score by safety-override rule on direct-risk items.'
                  )}
                </p>
                
                <div className="mt-3 space-y-2">
                  {detail.safety_flags.map((flag) => (
                    <div
                      key={flag.id}
                      className="p-3 bg-white rounded-xl border border-rose-200 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-800">
                          {flag.triggered_by}
                        </span>
                        {flag.notes && (
                          <div className="text-xs text-slate-600 mt-1">
                            <span className="font-semibold">{t('الملاحظات:', 'Notes:')}</span> {flag.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <SafetyStatusBadge status={flag.status} />
                        <button
                          onClick={() => setSelectedFlagForEdit(flag)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          {t('تحديث الإجراء', 'Action')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-domain Profile Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>{t('ملف الدرجات المعيارية للمجالات الخمسة', 'Multi-Domain Normed Profile')}</span>
          </div>
          <span className="text-xs text-slate-400">
            {t('المعايير المعتمدة T = 50, SD = 10', 'Standard Norms T = 50, SD = 10')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-start">{t('المجال النفسي', 'Psychological Domain')}</th>
                <th className="px-4 py-3.5 text-center">{t('الدرجة الخام (Raw)', 'Raw Score')}</th>
                <th className="px-4 py-3.5 text-center">{t('الدرجة المعيارية (T-Score)', 'T-Score')}</th>
                <th className="px-4 py-3.5 text-center">{t('الرتبة المئينية (Percentile)', 'Percentile')}</th>
                <th className="px-5 py-3.5 text-end">{t('مستوى الفرز (Screening Level)', 'Screening Level')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {domainsOrder.map((domKey) => {
                const score = detail.domain_scores[domKey];
                if (!score) return null;

                return (
                  <tr key={domKey} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div>{language === 'ar' ? score.domain_name_ar : score.domain_name_en}</div>
                      {language === 'ar' && (
                        <div className="text-xs text-slate-400 font-normal">{score.domain_name_en}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-bold text-slate-700">
                      {score.raw_score}
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-black text-slate-900 text-base">
                      {score.t_score.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-slate-600">
                      {score.percentile !== null ? `${score.percentile}%` : '—'}
                    </td>
                    <td className="px-5 py-4 text-end">
                      <ScreeningBadge level={score.screening_level} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-medium">
          {t(
            'تُعرض درجات المجالات بشكل مستقل دون درجة كلية مجمعة. نتائج الفرز ليست تشخيصًا ويجب تفسيرها مع تقييم مهني وسياق الطالب.',
            'Domains are reported independently, without a composite score. Screening results are not diagnoses; interpret them alongside professional assessment and the student’s context.'
          )}
        </div>
      </div>

      {/* Demographics Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          <span>{t('المعلومات العامة والبيانات الديموغرافية للطالب', 'Student Demographic Background')}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          {Object.entries(detail.background_responses).map(([k, v]) => (
            <div key={k} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">{k}</span>
              <span className="font-bold text-slate-800 text-sm">{v || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Keep the long audit trail available without overwhelming the overview. */}
      <details className="workspace-panel report-responses">
        <summary className="p-5 cursor-pointer text-slate-900">
          {t('عرض إجابات الطالب — 61 عبارة', 'View student responses — 61 items')}
        </summary>
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span>{t('تفاصيل إجابات الطالب على جميع العبارات (61 عبارة)', 'Detailed Item Responses (All 61 Items)')}</span>
          </div>
          <span className="text-xs text-slate-500">
            {t('العناصر المعلمة بـ (R) تم عكس تدريجها آليًا', 'Items tagged (R) are reverse-scored')}
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-start text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider sticky top-0 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-center w-12">#</th>
                <th className="px-4 py-3 text-start">{t('نص العبارة', 'Item Statement')}</th>
                <th className="px-4 py-3 text-start w-36">{t('المجال', 'Domain')}</th>
                <th className="px-4 py-3 text-center w-28">{t('إجابة الطالب', 'Raw Choice')}</th>
                <th className="px-4 py-3 text-center w-28">{t('الدرجة المحتسبة', 'Scored Value')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {detail.items.map((item) => {
                const isRiskItem = [42, 43, 45, 46, 48, 49].includes(item.item_number);
                const isHighRiskResponse = isRiskItem && item.raw_response >= 4;

                return (
                  <tr
                    key={item.item_number}
                    className={`transition-colors ${
                      isHighRiskResponse
                        ? 'bg-rose-50/80 font-semibold'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="px-4 py-3 text-center font-bold text-slate-500">
                      {item.item_number}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <div>{language === 'ar' ? item.text_ar : item.gloss_en}</div>
                      {language === 'ar' && (
                        <div className="text-[11px] text-slate-400">{item.gloss_en}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {item.domain}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-slate-800">
                        {scaleLabels[item.raw_response]?.[language === 'ar' ? 'ar' : 'en'] || item.raw_response}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1 font-mono font-bold text-slate-900">
                        <span>{item.scored_value}</span>
                        {item.is_reversed && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-sans" title={t('مقلوب التدريج', 'Reverse scored')}>
                            R
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>

      {/* Safety flag modal */}
      {selectedFlagForEdit && (
        <SafetyFlagModal
          flag={selectedFlagForEdit}
          onClose={() => setSelectedFlagForEdit(null)}
          onUpdated={() => {
            loadDetail();
          }}
        />
      )}

    </div>
  );
};
