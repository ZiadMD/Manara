import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Languages, LogOut } from 'lucide-react';
import { BrandMark } from './BrandMark';

export function Header() {
  const { user, role, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const roleLabel = role === 'student' ? t('مساحة الطالب', 'Student space') : role === 'counselor' ? t('مساحة المرشد', 'Counselor workspace') : t('إدارة المدرسة', 'School administration');

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand">
          <BrandMark />
          <div>
            <div className="brand-name">{t('بصيره', 'basira')}</div>
            <p className="brand-caption">{t('فهم أقرب، دعم أفضل', 'Understanding comes first')}</p>
          </div>
        </div>
        <div className="header-controls">
          {user && <span className="hidden sm:block text-xs text-slate-500 me-4">{roleLabel}</span>}
          <button onClick={toggleLanguage} className="text-button" aria-label={t('Switch to English', 'التبديل إلى العربية')}>
            <Languages size={16} aria-hidden="true" />
            <span lang={language === 'ar' ? 'en' : 'ar'}>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
          {user && <button onClick={logout} className="text-button" aria-label={t('تسجيل الخروج', 'Sign out')}>
            <LogOut size={17} aria-hidden="true" /><span className="hidden sm:inline">{t('خروج', 'Sign out')}</span>
          </button>}
        </div>
      </div>
    </header>
  );
}

