import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { Domain, Item, ResponseOption } from '../../types';
import { RESPONSE_SCALE } from '../../data/questionnaireData';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface DomainSectionProps {
  domain: Domain;
  items: Item[];
  responses: Record<number, number>;
  onSelectResponse: (itemNumber: number, value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstDomain: boolean;
  isLastDomain: boolean;
  domainIndex: number;
  totalDomains: number;
}

export const DomainSection: React.FC<DomainSectionProps> = ({
  domain,
  items,
  responses,
  onSelectResponse,
  onNext,
  onPrev,
  isFirstDomain,
  isLastDomain,
  domainIndex,
  totalDomains,
}) => {
  const { language, isRtl, t } = useLanguage();
  const ArrowForward = isRtl ? ArrowLeft : ArrowRight;
  const ArrowBack = isRtl ? ArrowRight : ArrowLeft;

  const domainItems = items.filter((item) => item.domain === domain.id);
  const answeredCount = domainItems.filter((item) => responses[item.number] !== undefined).length;
  const isComplete = answeredCount === domainItems.length;

  return (
    <div className="max-w-4xl mx-auto my-6 space-y-6">
      
      {/* Domain Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
              {domainIndex + 1}
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t(`المجال ${domainIndex + 1} من ${totalDomains}`, `Domain ${domainIndex + 1} of ${totalDomains}`)}
            </span>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold border ${
              isComplete
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {t(
              `تمت الإجابة على ${answeredCount} من ${domainItems.length}`,
              `Answered ${answeredCount} of ${domainItems.length}`
            )}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {language === 'ar' ? domain.name_ar : domain.name_en}
        </h2>

        {/* Verbatim Domain Intro text */}
        <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-sm sm:text-base font-medium leading-relaxed">
          {language === 'ar' ? domain.intro_ar : domain.intro_en}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {domainItems.map((item) => {
          const selectedVal = responses[item.number];
          const isAnswered = selectedVal !== undefined;

          return (
            <div
              key={item.number}
              className={`p-5 rounded-2xl border transition-all ${
                isAnswered
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-white/80 border-slate-200/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 mb-3.5">
                <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm">
                  {item.number}
                </span>
                <div className="grow pt-0.5">
                  <p className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                    {language === 'ar' ? item.text_ar : item.gloss_en}
                  </p>
                  {language === 'ar' && (
                    <p className="text-xs text-slate-400 mt-0.5 font-normal">
                      {item.gloss_en}
                    </p>
                  )}
                </div>
              </div>

              {/* 5-point scale selection buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                {RESPONSE_SCALE.map((opt: ResponseOption) => {
                  const isChecked = selectedVal === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onSelectResponse(item.number, opt.value)}
                      className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-sm font-bold transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200 scale-[1.02]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isChecked && <Check className="w-4 h-4 shrink-0" />}
                      <span>{language === 'ar' ? opt.label_ar : opt.label_en}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
        >
          <ArrowBack className="w-4 h-4" />
          <span>{isFirstDomain ? t('البيانات العامة', 'Demographics') : t('المجال السابق', 'Previous Domain')}</span>
        </button>

        <div className="flex items-center gap-3">
          {!isComplete && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>{t('يرجى استكمال جميع عبارات هذا المجال', 'Please answer all items in this domain')}</span>
            </div>
          )}

          <button
            type="button"
            disabled={!isComplete}
            onClick={onNext}
            className={`flex items-center gap-2 px-7 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
              isComplete
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>
              {isLastDomain
                ? t('مراجعة وإرسال التقييم', 'Review & Submit')
                : t('المجال التالي', 'Next Domain')}
            </span>
            <ArrowForward className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
