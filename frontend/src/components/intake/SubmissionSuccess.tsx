import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle, Home } from 'lucide-react';

interface SubmissionSuccessProps {
  assessmentId: string;
  onReset: () => void;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({
  assessmentId,
  onReset,
}) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-md p-8 sm:p-12 text-center">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <CheckCircle className="w-12 h-12" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
        {t('تم إرسال إجاباتك بنجاح', 'Submission Received Successfully')}
      </h1>

      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 font-bold text-base sm:text-lg mb-6">
        {t(
          'شكرًا لك على إكمال الاستبيان. تم استلام إجاباتك بنجاح.',
          'Thank you for completing the questionnaire. Your responses have been successfully received.'
        )}
      </div>

      <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
        {t(
          'يقوم المرشد الطلابي بمراجعة جميع المشاركات لدعمك ومساندتك في مسيرتك المدرسية. لا تتردد دائمًا في زيارة مكتب الإرشاد الطلابي في مدرستك.',
          'The school counselor reviews all submissions to support your well-being in school. You are always welcome to visit the school guidance office.'
        )}
      </p>

      <div className="text-xs text-slate-400 font-mono mb-8">
        {t('رقم التوثيق المرجعي:', 'Reference ID:')} {assessmentId}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-sm transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>{t('العودة للصفحة الرئيسية', 'Back to Home')}</span>
        </button>
      </div>
    </div>
  );
};
