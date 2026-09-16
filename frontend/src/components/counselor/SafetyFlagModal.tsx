import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { SafetyFlag } from '../../types';
import { request } from '../../api/client';
import { X, CheckCircle, ShieldAlert } from 'lucide-react';

interface SafetyFlagModalProps {
  flag: SafetyFlag;
  onClose: () => void;
  onUpdated: (updatedFlag: SafetyFlag) => void;
}

export const SafetyFlagModal: React.FC<SafetyFlagModalProps> = ({
  flag,
  onClose,
  onUpdated,
}) => {
  const { t } = useLanguage();
  const [status, setStatus] = useState<string>(flag.status);
  const [notes, setNotes] = useState<string>(flag.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await request<SafetyFlag>(`/safety-flags/${flag.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      });
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update safety flag');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-800">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <h3 className="font-bold text-lg">
              {t('إجراء ومتابعة مؤشر السلامة', 'Safety Indicator Action')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm">
            <div className="font-semibold text-slate-700 mb-1">
              {t('الطالب:', 'Student:')}{' '}
              <span className="font-bold text-slate-900">{flag.student_name}</span>
            </div>
            <div className="text-slate-600">
              <span className="font-semibold text-slate-700">{t('سبب التنبيه:', 'Triggered by:')}</span>{' '}
              <span className="font-mono text-rose-700 font-medium">{flag.triggered_by}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              {t('حالة التدخل والإجراء', 'Action / Review Status')}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="open">{t('مفتوح (قيد الانتظار والمتابعة)', 'Open (Pending Review)')}</option>
              <option value="reviewed">{t('تمت المراجعة والتدخل الداخلي', 'Reviewed & Handled Internally')}</option>
              <option value="escalated">{t('تصعيد إلى فريق الدعم النفسي المتخصص', 'Escalated to Specialized Team')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              {t('ملاحظات المرشد الطلابي والتدخل', 'Counselor Clinical Notes')}
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t(
                'اكتب تفاصيل الإجراءات المتخذة (مثال: تم عقد جلسة فردية مع الطالب، التواصل مع ولي الأمر...)',
                'Document actions taken (e.g., individual counseling session held, parents contacted...)'
              )}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {t('إلغاء', 'Cancel')}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? t('جارٍ الحفظ...', 'Saving...') : t('تحديث الحالة', 'Update Status')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
