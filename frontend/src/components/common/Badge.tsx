import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface ScreeningBadgeProps {
  level: 'low' | 'medium' | 'high' | 'very_high' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const ScreeningBadge: React.FC<ScreeningBadgeProps> = ({ level, size = 'md' }) => {
  const { t } = useLanguage();

  const config = {
    low: {
      labelAr: 'منخفض',
      labelEn: 'Low',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
    },
    medium: {
      labelAr: 'متوسط',
      labelEn: 'Medium',
      classes: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
    },
    high: {
      labelAr: 'مرتفع',
      labelEn: 'High',
      classes: 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-600/20',
    },
    very_high: {
      labelAr: 'مرتفع جداً',
      labelEn: 'Very High',
      classes: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20 font-bold',
    },
  }[level] || {
    labelAr: level,
    labelEn: level,
    classes: 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full border ring-1 ring-inset ${config.classes} ${sizeClasses}`}
    >
      {t(config.labelAr, config.labelEn)}
    </span>
  );
};

interface SafetyStatusBadgeProps {
  status: 'open' | 'reviewed' | 'escalated' | string;
}

export const SafetyStatusBadge: React.FC<SafetyStatusBadgeProps> = ({ status }) => {
  const { t } = useLanguage();

  const config = {
    open: {
      labelAr: 'أولوية مفتوحة (قيد التدخل)',
      labelEn: 'Open (Priority Review)',
      classes: 'bg-red-100 text-red-800 border-red-300 animate-pulse',
    },
    reviewed: {
      labelAr: 'تمت المراجعة',
      labelEn: 'Reviewed',
      classes: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    escalated: {
      labelAr: 'تم التصعيد',
      labelEn: 'Escalated',
      classes: 'bg-purple-100 text-purple-800 border-purple-300 font-semibold',
    },
  }[status] || {
    labelAr: status,
    labelEn: status,
    classes: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.classes}`}>
      {t(config.labelAr, config.labelEn)}
    </span>
  );
};
