import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  isRtl: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (arText: string, enText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('manara_lang') as Language) || 'ar';
  });

  const isRtl = language === 'ar';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('manara_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  const t = (arText: string, enText: string) => {
    return language === 'ar' ? arText : enText;
  };

  return (
    <LanguageContext.Provider value={{ language, isRtl, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
