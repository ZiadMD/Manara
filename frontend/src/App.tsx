import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/common/Header';
import { Welcome } from './components/common/Welcome';
import { StudentIntakeFlow } from './components/intake/StudentIntakeFlow';
import { CounselorDashboard } from './components/counselor/CounselorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

function AppShell() {
  const { user, role } = useAuth();
  const { t } = useLanguage();
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">{t('تجاوز إلى المحتوى', 'Skip to content')}</a>
      <Header />
      <main id="main-content" tabIndex={-1} className="app-main" key={user?.id ?? 'welcome'}>
        {!user ? <Welcome /> : <>
          {role === 'student' && <StudentIntakeFlow />}
          {role === 'counselor' && <CounselorDashboard />}
          {role === 'admin' && <AdminDashboard />}
        </>}
      </main>
      <footer className="site-footer">
        <span>{t('بصيره — فهم أقرب، دعم أفضل.', 'Basira — Understanding comes first.')}</span>
        <span>{t('أداة كشف مبكر، وليست تشخيصًا أو خدمة طوارئ.', 'A screening tool. Not a diagnosis or an emergency service.')}</span>
      </footer>
    </div>
  );
}

export function App() {
  return <LanguageProvider><AuthProvider><AppShell /></AuthProvider></LanguageProvider>;
}

export default App;

