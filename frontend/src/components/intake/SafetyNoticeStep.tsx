import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { MANDATORY_SAFETY_NOTICE } from '../../data/questionnaireData';
import { HeartHandshake, CheckCircle2 } from 'lucide-react';

interface SafetyNoticeStepProps {
  onAcknowledge: () => void;
}

export const SafetyNoticeStep: React.FC<SafetyNoticeStepProps> = ({ onAcknowledge }) => {
  const { language, t } = useLanguage();
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 sm:p-8 bg-amber-50/80 rounded-2xl border-2 border-amber-300 shadow-md">
      <div className="flex items-center gap-3 mb-4 text-amber-800">
        <div className="p-3 bg-amber-100 rounded-xl">
          <HeartHandshake className="w-8 h-8 text-amber-700" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">
            {t('تنبيه وإرشاد مهم لسلامتك', 'Important Notice for Your Well-being')}
          </h2>
          <p className="text-xs sm:text-sm text-amber-700">
            {t('يرجى قراءة هذه الرسالة بعناية قبل المتابعة', 'Please read this message carefully before continuing')}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6 bg-white rounded-xl border border-amber-200 text-slate-800 leading-relaxed text-base sm:text-lg font-medium shadow-inner">
        {language === 'ar' ? MANDATORY_SAFETY_NOTICE.ar : MANDATORY_SAFETY_NOTICE.en}
      </div>

      <div className="mt-6 pt-4 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <label className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasAcknowledged}
            onChange={(e) => setHasAcknowledged(e.target.checked)}
            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
          />
          <span>{t('قرأت هذه الرسالة وأدرك أهميتها', 'I have read and understood this notice')}</span>
        </label>

        <button
          type="button"
          disabled={!hasAcknowledged}
          onClick={onAcknowledge}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
            hasAcknowledged
              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-blue-200'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{t('متابعة إلى القسم التالي', 'Continue to next section')}</span>
        </button>
      </div>
    </div>
  );
};
