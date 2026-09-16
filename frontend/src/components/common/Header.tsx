import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Shield, UserCheck, GraduationCap, Languages, LogOut } from 'lucide-react';
import type { Role } from '../../types';

export const Header: React.FC = () => {
  const { user, role, logout, switchDemoRole } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  const roleLabelMap: Record<Role, { ar: string; en: string; icon: any }> = {
    student: { ar: 'طالب', en: 'Student', icon: GraduationCap },
    counselor: { ar: 'مرشد طلابي', en: 'Counselor', icon: UserCheck },
    admin: { ar: 'مدير النظام', en: 'Admin', icon: Shield },
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shadow-blue-200">
              م
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  {t('منارة', 'Manara')}
                </span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium border border-blue-200">
                  {t('كشف مبكر', 'Early Screening')}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {t(
                  'منصة الكشف المبكر للمؤشرات النفسية لطلاب المرحلتين المتوسطة والثانوية',
                  'Digital Screening Platform for Middle & High School Students'
                )}
              </p>
            </div>
          </div>

          {/* Right Controls: Role switcher, Language, User profile */}
          <div className="flex items-center gap-3">
            
            {/* Quick Demo Persona Switcher */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="px-2 text-slate-500 font-medium">{t('تجربة كـ:', 'Role:')}</span>
              {(['student', 'counselor', 'admin'] as Role[]).map((r) => {
                const isActive = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => switchDemoRole(r)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t(roleLabelMap[r].ar, roleLabelMap[r].en)}
                  </button>
                );
              })}
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title={t('تغيير اللغة إلى الإنجليزية', 'Switch language to Arabic')}
            >
              <Languages className="w-4 h-4 text-slate-500" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Current user badge & logout */}
            {user && (
              <div className="flex items-center gap-2 ps-2 border-s border-slate-200">
                <div className="text-end hidden sm:block">
                  <div className="text-xs font-bold text-slate-800">{user.name}</div>
                  <div className="text-[10px] text-slate-500">{user.email}</div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title={t('تسجيل الخروج', 'Sign out')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
