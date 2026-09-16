import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { INSTRUCTIONS } from '../../data/questionnaireData';
import { FileText, ArrowLeft, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface InstructionsViewProps {
  onStart: () => void;
}

export const InstructionsView: React.FC<InstructionsViewProps> = ({ onStart }) => {
  const { language, isRtl, t } = useLanguage();

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-3xl mx-auto my-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white">
        <div className="inline-flex p-3 bg-white/10 rounded-xl mb-4 backdrop-blur-xs">
          <FileText className="w-8 h-8 text-blue-100" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {t('مرحبًا بك في استبيان المؤشرات النفسية', 'Welcome to the Psychological Indicator Screening')}
        </h1>
        <p className="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
          {t(
            'نهدف من خلال هذا الاستبيان إلى تقديم الدعم والمساندة لك في بيئتك المدرسية.',
            'This questionnaire is designed to provide you with supportive psychological guidance in school.'
          )}
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        
        {/* Preserved Verbatim Administration Instructions */}
        <div className="p-5 bg-blue-50/60 rounded-xl border border-blue-100">
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">
            {t('تعليمات الإجابة', 'Administration Instructions')}
          </h3>
          <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium">
            "{language === 'ar' ? INSTRUCTIONS.ar : INSTRUCTIONS.en}"
          </p>
        </div>

        {/* Helpful Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {t('سرية البيانات', 'Confidential & Safe')}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {t(
                  'إجاباتك تراجع بسرية تامة من قِبل المرشد الطلابي المختص فقط.',
                  'Your responses are confidentially reviewed solely by your qualified school counselor.'
                )}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {t('الوقت المقدر', 'Estimated Time')}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {t(
                  'يستغرق الاستبيان حوالي 10–15 دقيقة. لا توجد إجابات صحيحة أو خاطئة.',
                  'Takes around 10–15 minutes. There are no right or wrong answers.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-md shadow-blue-200 transition-all cursor-pointer"
          >
            <span>{t('بدء الاستبيان', 'Start Screening')}</span>
            <ArrowIcon className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
