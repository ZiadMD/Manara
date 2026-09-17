import { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Clock3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Role } from '../../types';

export function Welcome() {
  const { switchDemoRole, isLoading } = useAuth();
  const { t, isRtl } = useLanguage();
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [error, setError] = useState(false);
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const enter = async (role: Role) => {
    setError(false);
    setPendingRole(role);
    try { await switchDemoRole(role); }
    catch { setError(true); }
    finally { setPendingRole(null); }
  };
  const personas: { role: Role; title: string; description: string }[] = [
    { role: 'student', title: t('أنا طالب', 'I’m a student'), description: t('أشارك ما أشعر به من خلال الاستبيان.', 'Share how you’ve been feeling with a guided questionnaire.') },
    { role: 'counselor', title: t('أنا مرشد طلابي', 'I’m a counselor'), description: t('أراجع المشاركات وأتابع الطلاب المحتاجين للدعم.', 'Review check-ins and follow up with students who need support.') },
    { role: 'admin', title: t('أنا مدير النظام', 'I’m an administrator'), description: t('أتابع المؤشرات المجمعة وإعدادات السلامة.', 'View school-wide trends and manage safety settings.') },
  ];

  return (
    <div className="welcome">
      <div className="welcome-grid">
        <section aria-labelledby="welcome-heading">
          <p className="eyebrow">{t('بصيره / العناية بالطالب', 'Basira / Student well-being')}</p>
          <h1 id="welcome-heading" className="welcome-title">
            {t('فهمٌ أقرب.', 'A little understanding.')}<br />
            <span>{t('دعمٌ أفضل.', 'A better way forward.')}</span>
          </h1>
          <p className="welcome-copy">{t('قد يصعب أحيانًا التعبير عمّا نشعر به. بصيره تساعدك على مشاركة تجربتك، وتساعد المرشد الطلابي على معرفة كيف يدعمك.', 'Putting feelings into words isn’t always easy. Basira helps you share your experience, so your school counselor can better understand how to support you.')}</p>
          <div className="welcome-note"><Clock3 size={16} aria-hidden="true" />{t('١٠–١٥ دقيقة · على مهل، دون إجابات صحيحة أو خاطئة', '10–15 minutes · No right or wrong answers')}</div>
        </section>
        <section className="entry-panel" aria-labelledby="entry-heading" aria-busy={isLoading}>
          <span className="eyebrow">{t('ابدأ من هنا', 'Start here')}</span>
          <h2 id="entry-heading">{t('مساحتك في بصيره', 'Find your space')}</h2>
          <p>{t('اختر دورك لاستكشاف المنصة بحساب تجريبي.', 'Choose your role to explore the platform with a demo account.')}</p>
          {error && <p className="inline-error" role="alert">{t('تعذر تسجيل الدخول. تحقق من اتصالك وحاول مجددًا. قد تكون الخدمة غير متاحة مؤقتًا.', 'Couldn’t sign in. Check your connection and try again. The service may be temporarily unavailable.')}</p>}
          {personas.map(({ role, title, description }, index) => (
            <button key={role} className="persona-button" disabled={isLoading} onClick={() => void enter(role)}>
              <span className="persona-number" aria-hidden="true">0{index + 1}</span>
              <span><strong>{title}</strong><small>{description}</small></span>
              {pendingRole === role ? <Loader2 size={19} className="animate-spin" aria-label={t('جارٍ الدخول', 'Signing in')} /> : <Arrow size={19} aria-hidden="true" />}
            </button>
          ))}
          <div className="demo-note">{t('نسخة تجريبية — لا تدخل بيانات شخصية أو صحية حقيقية في الحسابات المشتركة.', 'Demo environment — don’t enter real personal or health information in shared accounts.')}</div>
        </section>
      </div>
      <div className="welcome-bottom">
        <section><h3>{t('ابدأ بما تشعر به', 'Start with how you feel')}</h3><p>{t('أسئلة واضحة عن تجربتك مؤخرًا في المدرسة وخارجها، قسمًا بعد قسم.', 'Clear questions about your recent experiences at school and beyond, one section at a time.')}</p></section>
        <section><h3>{t('خطوة نحو الدعم، لا تشخيص', 'A check-in, not a diagnosis')}</h3><p>{t('يساعد الاستبيان على تحديد الحاجة للدعم، ولا يحل محل التقييم المتخصص.', 'Screening helps identify where support may be useful. It does not replace a professional assessment.')}</p></section>
        <section><h3>{t('وراء كل إجابة، إنسان', 'Support from a person')}</h3><p>{t('يراجع المرشد الطلابي المشاركات. إذا احتجت للمساعدة الآن، تواصل مع شخص بالغ تثق به أو خدمات الطوارئ المحلية.', 'A school counselor reviews submissions. If you need help now, contact a trusted adult or local emergency services.')}</p></section>
      </div>
    </div>
  );
}
