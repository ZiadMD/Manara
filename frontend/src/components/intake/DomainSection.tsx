import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { Domain, Item, ResponseOption } from '../../types';
import { RESPONSE_SCALE } from '../../data/questionnaireData';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
    <section className="questionnaire" aria-labelledby="domain-title">
      <div className="domain-heading">
        <div className="domain-meta">
          <span>{t(`القسم ${domainIndex + 1} من ${totalDomains}`, `Section ${domainIndex + 1} of ${totalDomains}`)}</span>
          <span aria-live="polite">{t(`${answeredCount} من ${domainItems.length} مكتملة`, `${answeredCount} of ${domainItems.length} answered`)}</span>
        </div>
        <h2 id="domain-title">{language === 'ar' ? domain.name_ar : domain.name_en}</h2>
        <p>{language === 'ar' ? domain.intro_ar : domain.intro_en}</p>
      </div>
      <div className="question-list">
        {domainItems.map((item) => (
          <fieldset className="question" key={item.number}>
            <legend><span>{String(item.number).padStart(2, '0')}</span>{language === 'ar' ? item.text_ar : item.gloss_en}</legend>
            <div className="response-scale">
              {RESPONSE_SCALE.map((opt: ResponseOption) => (
                <label key={opt.value} className="response-choice">
                  <input type="radio" name={`item-${item.number}`} value={opt.value}
                    checked={responses[item.number] === opt.value}
                    onChange={() => onSelectResponse(item.number, opt.value)} />
                  <span>{language === 'ar' ? opt.label_ar : opt.label_en}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="question-nav">
        <p id="completion-hint">{isComplete
          ? (isLastDomain ? t('ستُرسل إجاباتك إلى المرشد الطلابي. يمكنك الرجوع لتعديلها قبل الإرسال.', 'Your answers will be sent to your school counselor. You can go back to edit them before submitting.') : t('اكتمل هذا القسم. يمكنك المتابعة أو تعديل إجاباتك.', 'This section is complete. Continue when you’re ready, or change any answer.'))
          : t(`تبقّت ${domainItems.length - answeredCount} عبارة. أكمل هذا القسم للمتابعة.`, `${domainItems.length - answeredCount} items remaining. Complete this section to continue.`)}</p>
        <button type="button" onClick={onPrev} className="secondary-button"><ArrowBack size={16} aria-hidden="true" /><span>{isFirstDomain ? t('البيانات العامة', 'Background') : t('القسم السابق', 'Previous section')}</span></button>
        <button type="button" disabled={!isComplete} aria-describedby="completion-hint" onClick={onNext} className="primary-button"><span>{isLastDomain ? t('إرسال إجاباتي', 'Submit my answers') : t('القسم التالي', 'Next section')}</span><ArrowForward size={16} aria-hidden="true" /></button>
      </div>
    </section>
  );
};
