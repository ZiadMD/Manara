import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { INSTRUCTIONS } from '../../data/questionnaireData';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface InstructionsViewProps {
  onStart: () => void;
}

export const InstructionsView: React.FC<InstructionsViewProps> = ({ onStart }) => {
  const { language, isRtl, t } = useLanguage();

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="intake-intro">
      <div className="intro-heading">
        <p className="eyebrow">{t('مساحة الطالب / قبل أن تبدأ', 'Student space / Before you begin')}</p>
        <h1>{t('خذ وقتك. إجاباتك تساعدنا على فهمك.', 'Take your time. This is about you.')}</h1>
        <p>{t('يساعد هذا الاستبيان المرشد الطلابي على فهم تجربتك وتقديم الدعم المناسب. ليس اختبارًا، ولا يعطي تشخيصًا.', 'This questionnaire helps your school counselor understand your experience and offer support. It isn’t a test, and it doesn’t provide a diagnosis.')}</p>
      </div>
      <section className="instruction-copy" aria-labelledby="instructions-title">
        <h2 id="instructions-title">{t('كيف تجيب', 'How to answer')}</h2>
        <p>{language === 'ar' ? INSTRUCTIONS.ar : INSTRUCTIONS.en}</p>
      </section>
      <div className="intro-facts">
        <section><h3>{t('١٠–١٥ دقيقة، خمسة أقسام', '10–15 minutes, five sections')}</h3><p>{t('٦١ عبارة عن تجربتك. يمكنك الرجوع لتغيير إجاباتك قبل الإرسال. لا تغلق الصفحة؛ لا يتم حفظ الإجابات قبل الإرسال.', '61 statements about your experience. You can go back to change your answers before submitting. Keep this page open; answers aren’t saved until you submit.')}</p></section>
        <section><h3>{t('من يراجع إجاباتي؟', 'Who reviews my answers?')}</h3><p>{t('يراجع المرشد الطلابي المشاركات لتقديم الدعم. تعرض لوحة الإدارة إحصاءات مجمعة فقط، وليس إجاباتك الفردية.', 'Your school counselor reviews submissions to offer support. The administration dashboard shows aggregate statistics, not your individual answers.')}</p></section>
      </div>
      <div className="intake-actions">
        <p>{t('تحتاج للحديث الآن؟ تواصل مع مرشدك أو شخص بالغ تثق به. لا تنتظر نتيجة الاستبيان لطلب المساعدة.', 'Need to talk now? Reach out to your counselor or a trusted adult. You don’t need to finish the questionnaire to ask for help.')}</p>
        <button onClick={onStart} className="primary-button"><span>{t('لنبدأ', 'Let’s begin')}</span><ArrowIcon size={18} aria-hidden="true" /></button>
      </div>
    </section>
  );
};
