import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { AssessmentSummary, SafetyFlag } from '../../types';
import { request } from '../../api/client';
import { ScreeningBadge, SafetyStatusBadge } from '../common/Badge';
import { StudentProfileReport } from './StudentProfileReport';
import { SafetyFlagModal } from './SafetyFlagModal';
import {
  ShieldAlert,
  Users,
  Search,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const CounselorDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [safetyFlags, setSafetyFlags] = useState<SafetyFlag[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [selectedFlagForEdit, setSelectedFlagForEdit] = useState<SafetyFlag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [assessmentsData, flagsData] = await Promise.all([
        request<AssessmentSummary[]>('/assessments/'),
        request<SafetyFlag[]>('/safety-flags/'),
      ]);
      setAssessments(assessmentsData);
      setSafetyFlags(flagsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load counselor data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (selectedAssessmentId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <StudentProfileReport
          assessmentId={selectedAssessmentId}
          onBack={() => {
            setSelectedAssessmentId(null);
            fetchData();
          }}
        />
      </div>
    );
  }

  const openFlags = safetyFlags.filter((f) => f.status === 'open');

  const filteredAssessments = assessments.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.student_name.toLowerCase().includes(q) ||
      (a.school_stage && a.school_stage.toLowerCase().includes(q))
    );
  });

  return (
    <div className="workspace-page max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
      
      {/* Top Banner & Refresh */}
      <div className="page-heading flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">{t('بصيره / مساحة المرشد', 'Basira / Counselor workspace')}</p>
          <h1 className="text-2xl sm:text-3xl text-slate-900">
            {t('الدعم يبدأ بالمتابعة', 'Care starts with a check-in')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t(
              'متابعة نتائج الفرز النفسي والتدخل الفوري لمؤشرات السلامة المفتوحة.',
              'Monitor student psychological screening results and triage active safety flags.'
            )}
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{t('تحديث البيانات', 'Refresh Data')}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!isLoading && !error && <div className="metric-strip">
        <div><span>{t('التقييمات المستلمة', 'Check-ins received')}</span><strong>{assessments.length}</strong></div>
        <div><span>{t('تحتاج مراجعة السلامة', 'Awaiting safety review')}</span><strong>{openFlags.length}</strong></div>
        <div><span>{t('حالات مصعّدة', 'Escalated cases')}</span><strong>{safetyFlags.filter((flag) => flag.status === 'escalated').length}</strong></div>
      </div>}
      {isLoading && <p role="status" className="py-8 text-sm text-slate-500">{t('جارٍ تحميل المشاركات ومؤشرات السلامة…', 'Loading check-ins and safety flags…')}</p>}

      {/* Priority 1: Open Safety Flags Queue */}
      <div className="workspace-panel" aria-busy={isLoading}>
        <div className="p-5 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-rose-900">
            <div className="p-2 bg-rose-100 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <h2 className="font-black text-base">
                {t('مؤشرات السلامة ذات الأولوية القصوى (إيذاء الذات)', 'Top Priority Safety Flags (Self-Harm)')}
              </h2>
              <p className="text-xs text-rose-700">
                {t(
                  'حالات تم رصدها بناءً على قاعدة التجاوز لبنود الخطر المباشر',
                  'Cases triggered via direct-risk safety override rule'
                )}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-rose-600 text-white rounded-full text-xs font-bold shadow-xs">
            {openFlags.length} {t('قيد المراجعة', 'Open')}
          </span>
        </div>

        {openFlags.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            {isLoading ? t('جارٍ التحميل…', 'Loading…') : error ? t('تعذر التحقق من مؤشرات السلامة. أعد المحاولة.', 'Safety flags could not be verified. Please retry.') : t('لا توجد مؤشرات سلامة مفتوحة حاليًا. لا يغني ذلك عن المتابعة المعتادة.', 'No open safety flags at present. Continue routine student follow-up.')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-start">{t('الطالب', 'Student')}</th>
                  <th className="px-4 py-3 text-start">{t('سبب التنبيه', 'Triggered By')}</th>
                  <th className="px-4 py-3 text-center">{t('وقت الرصد', 'Detected At')}</th>
                  <th className="px-4 py-3 text-center">{t('الحالة', 'Status')}</th>
                  <th className="px-5 py-3 text-end">{t('الإجراء', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {openFlags.map((flag) => (
                  <tr key={flag.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      <div>{flag.student_name}</div>
                      {flag.student_stage && (
                        <span className="text-[11px] font-normal text-slate-500">
                          {flag.student_stage === 'middle' ? t('متوسط', 'Middle') : t('ثانوي', 'High')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-rose-800 font-medium text-xs max-w-md">
                      {flag.triggered_by}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-xs text-slate-500">
                      {new Date(flag.created_at).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <SafetyStatusBadge status={flag.status} />
                    </td>
                    <td className="px-5 py-3.5 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedFlagForEdit(flag)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          {t('مراجعة / تدخل', 'Triage')}
                        </button>
                        <button
                          onClick={() => setSelectedAssessmentId(flag.assessment_id)}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          {t('الملف الكامل', 'Profile')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Priority 2: Student Assessments List */}
      <div className="workspace-panel" aria-busy={isLoading}>
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-lg text-slate-900">
              {t('سجل تقييمات الطلاب', 'Student Assessments Registry')}
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
              {assessments.length}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
            <input
              type="search"
              aria-label={t('البحث بالاسم أو المرحلة', 'Search by name or school stage')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('بحث بالاسم أو المرحلة...', 'Search by name or stage...')}
              className="w-full ps-9 pe-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {filteredAssessments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{isLoading ? t('جارٍ تحميل المشاركات…', 'Loading check-ins…') : error ? t('تعذر تحميل المشاركات. أعد المحاولة.', 'Check-ins could not be loaded. Please retry.') : searchQuery ? t('لا توجد نتائج تطابق البحث. جرّب اسمًا أو مرحلة أخرى.', 'No matching check-ins. Try another name or stage.') : t('لم تُستلم أي مشاركة بعد. ستظهر المشاركات المكتملة هنا.', 'No check-ins yet. Completed submissions will appear here.')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 text-start">{t('الطالب', 'Student')}</th>
                  <th className="px-4 py-3.5 text-start">{t('المرحلة', 'Stage')}</th>
                  <th className="px-4 py-3.5 text-center">{t('تاريخ التقديم', 'Submission Date')}</th>
                  <th className="px-4 py-3.5 text-center">{t('أعلى مؤشر فرز', 'Highest Level')}</th>
                  <th className="px-4 py-3.5 text-center">{t('مؤشر الأولوية', 'Safety Override')}</th>
                  <th className="px-5 py-3.5 text-end">{t('التقرير', 'Report')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssessments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div>{a.student_name}</div>
                      <div className="text-[11px] font-mono text-slate-400 font-normal">{a.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {a.school_stage === 'middle'
                        ? t('متوسط', 'Middle school')
                        : a.school_stage === 'high'
                        ? t('ثانوي', 'High school')
                        : a.school_stage || '—'}
                    </td>
                    <td className="px-4 py-4 text-center text-slate-500 font-mono text-xs">
                      {new Date(a.submitted_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {a.highest_screening_level ? (
                        <ScreeningBadge level={a.highest_screening_level} size="sm" />
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {a.has_safety_flags ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{t('نعم', 'Flagged')}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">{t('لا يوجد', 'None')}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-end">
                      <button
                        onClick={() => setSelectedAssessmentId(a.id)}
                        className="flex items-center gap-1.5 ms-auto px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t('عرض التقرير', 'View Profile')}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Flag Edit Modal */}
      {selectedFlagForEdit && (
        <SafetyFlagModal
          flag={selectedFlagForEdit}
          onClose={() => setSelectedFlagForEdit(null)}
          onUpdated={() => fetchData()}
        />
      )}

    </div>
  );
};
