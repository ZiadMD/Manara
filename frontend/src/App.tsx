import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/common/Header';
import { StudentIntakeFlow } from './components/intake/StudentIntakeFlow';
import { CounselorDashboard } from './components/counselor/CounselorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GraduationCap, UserCheck, Shield } from 'lucide-react';

const MainContent: React.FC = () => {
  const { user, role, isLoading, switchDemoRole } = useAuth();
  const { t } = useLanguage();

  // If not logged in, show Persona Selection & Sign-in portal
  if (!user) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 relative">
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 animate-pulse" />
        )}
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl font-black mx-auto shadow-md shadow-blue-200">
            م
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {t('منصة منارة الرقمية', 'Manara Screening Platform')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t(
                'الكشف المبكر لمؤشرات الاضطرابات النفسية لطلاب المرحلتين المتوسطة والثانوية',
                'Early detection of psychological disorder indicators in middle/high school students'
              )}
            </p>
          </div>

          {/* 1-Click Fast Persona Switcher */}
          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {t('دخول سريع بحساب تجريبي', 'Quick Demo Access')}
            </span>

            <button
              disabled={isLoading}
              onClick={() => switchDemoRole('student')}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-start cursor-pointer group disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    {t('طالب (استبيان الكشف)', 'Student Intake')}
                  </div>
                  <div className="text-[11px] text-slate-400">student@manara.school</div>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600">
                {t('دخول ←', 'Login →')}
              </span>
            </button>

            <button
              disabled={isLoading}
              onClick={() => switchDemoRole('counselor')}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-start cursor-pointer group disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    {t('مرشد طلابي (التقارير ومؤشرات السلامة)', 'School Counselor')}
                  </div>
                  <div className="text-[11px] text-slate-400">counselor@manara.school</div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600">
                {t('دخول ←', 'Login →')}
              </span>
            </button>

            <button
              disabled={isLoading}
              onClick={() => switchDemoRole('admin')}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-start cursor-pointer group disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl group-hover:scale-105 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    {t('مدير النظام (إحصاءات منزوعة الهوية)', 'System Admin')}
                  </div>
                  <div className="text-[11px] text-slate-400">admin@manara.school</div>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-600">
                {t('دخول ←', 'Login →')}
              </span>
            </button>
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            {t('كلمة المرور الافتراضية لجميع الحسابات التجريبية: Password123!', 'Default password for demo accounts: Password123!')}
          </div>

        </div>
      </div>
    );
  }

  // Active Authenticated Role View
  return (
    <main className="pb-16">
      {role === 'student' && <StudentIntakeFlow />}
      {role === 'counselor' && <CounselorDashboard />}
      {role === 'admin' && <AdminDashboard />}
    </main>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
          <Header />
          <div className="grow">
            <MainContent />
          </div>
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
