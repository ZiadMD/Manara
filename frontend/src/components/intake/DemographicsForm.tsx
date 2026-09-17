import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DEMOGRAPHIC_FIELDS } from '../../data/questionnaireData';
import { UserCheck, ArrowLeft, ArrowRight } from 'lucide-react';

interface DemographicsFormProps {
  initialValues: Record<string, string>;
  onSubmit: (values: Record<string, string>) => void;
  onBack: () => void;
}

export const DemographicsForm: React.FC<DemographicsFormProps> = ({
  initialValues,
  onSubmit,
  onBack,
}) => {
  const { language, isRtl, t } = useLanguage();
  const [formData, setFormData] = useState<Record<string, string>>(initialValues);
  const [error, setError] = useState<string | null>(null);

  const ArrowForward = isRtl ? ArrowLeft : ArrowRight;
  const ArrowBack = isRtl ? ArrowRight : ArrowLeft;

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (error && id === 'school_stage') {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.school_stage) {
      setError(
        t(
          'يرجى تحديد المرحلة الدراسية للمتابعة (مطلوب تشغيليًا)',
          'Please select your school stage to continue (operationally required)'
        )
      );
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto my-4 bg-white rounded-xl border border-slate-200 p-6 sm:p-10 background-form">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t('المعلومات العامة والديموغرافية', 'Background & Demographic Information')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t(
              'تساعد هذه البيانات في توجيه التقييم وتقديم المساندة المناسبة لمرحلتك.',
              'This information helps route the screening and provide age-appropriate guidance.'
            )}
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DEMOGRAPHIC_FIELDS.map((field) => {
            const isFieldRequired = field.required;
            const label = language === 'ar' ? field.label_ar : field.label_en;
            const value = formData[field.id] || '';

            return (
              <div
                key={field.id}
                className={
                  field.id === 'family_mental_health_history' || field.id === 'family_income'
                    ? 'sm:col-span-2'
                    : ''
                }
              >
                <label htmlFor={`background-${field.id}`} className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  {label}{' '}
                  {isFieldRequired ? (
                    <span className="text-rose-500 font-bold">*</span>
                  ) : (
                    <span className="text-slate-400 font-normal text-xs">
                      ({t('اختياري', 'Optional')})
                    </span>
                  )}
                </label>

                {field.type === 'select' ? (
                  <select
                    id={`background-${field.id}`}
                    required={isFieldRequired}
                    value={value}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="">
                      {t('-- حدد الإجابة --', '-- Select an option --')}
                    </option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {language === 'ar' ? opt.label_ar : opt.label_en}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`background-${field.id}`}
                    required={isFieldRequired}
                    type={field.type}
                    value={value}
                    min={field.min}
                    max={field.max}
                    placeholder={
                      language === 'ar'
                        ? field.placeholder_ar || ''
                        : field.placeholder_en || ''
                    }
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
          >
            <ArrowBack className="w-4 h-4" />
            <span>{t('العودة للتعليمات', 'Back to Instructions')}</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-200 transition-all cursor-pointer"
          >
            <span>{t('الانتقال للعبارات', 'Proceed to Items')}</span>
            <ArrowForward className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
