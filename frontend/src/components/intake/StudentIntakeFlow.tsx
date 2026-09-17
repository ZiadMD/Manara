import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DOMAINS, ITEMS } from '../../data/questionnaireData';
import { InstructionsView } from './InstructionsView';
import { DemographicsForm } from './DemographicsForm';
import { DomainSection } from './DomainSection';
import { SafetyNoticeStep } from './SafetyNoticeStep';
import { SubmissionSuccess } from './SubmissionSuccess';
import { request } from '../../api/client';
import { Loader2 } from 'lucide-react';

type FlowStep =
  | 'instructions'
  | 'demographics'
  | 'domain-0'
  | 'domain-1'
  | 'domain-2'
  | 'domain-3'
  | 'safety-notice'
  | 'domain-4'
  | 'success';

export const StudentIntakeFlow: React.FC = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState<FlowStep>('instructions');
  const [demographics, setDemographics] = useState<Record<string, string>>({
    school_stage: 'middle',
  });
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [completedAssessmentId, setCompletedAssessmentId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  useEffect(() => {
    if (!Object.keys(responses).length || step === 'success') return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [responses, step]);

  const handleSelectResponse = (itemNumber: number, value: number) => {
    setResponses((prev) => ({ ...prev, [itemNumber]: value }));
  };

  const handleDemographicsSubmit = (values: Record<string, string>) => {
    setDemographics(values);
    setStep('domain-0');
  };

  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

    const formattedBackground = Object.entries(demographics).map(([k, v]) => ({
      field_name: k,
      value: v,
    }));

    const formattedItems = Object.entries(responses).map(([k, v]) => ({
      item_number: parseInt(k, 10),
      response_value: v,
    }));

    try {
      const receipt = await request<{ assessment_id: string; status: string }>(
        '/assessments/submit',
        {
          method: 'POST',
          body: JSON.stringify({
            background_responses: formattedBackground,
            item_responses: formattedItems,
          }),
        }
      );
      setCompletedAssessmentId(receipt.assessment_id);
      setStep('success');
    } catch (err: any) {
      console.error('Submission failed:', err);
      setSubmissionError(err.message || t('حدث خطأ أثناء إرسال الإجابات. يرجى المحاولة مرة أخرى.', 'Error submitting assessment. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setStep('instructions');
    setDemographics({ school_stage: 'middle' });
    setResponses({});
    setCompletedAssessmentId(null);
    setSubmissionError(null);
  };

  return (
    <div className="intake-container" ref={containerRef} tabIndex={-1}>
      {step !== 'instructions' && step !== 'success' && (
        <div className="intake-progress">
          <div>
            <span>{t('تقدّم الاستبيان', 'Screening progress')}</span>
            <span>{Object.keys(responses).length} / {ITEMS.length} {t('عبارة', 'items')}</span>
          </div>
          <progress max={ITEMS.length} value={Object.keys(responses).length} aria-label={t('نسبة الإنجاز', 'Completion progress')} />
        </div>
      )}

      {submissionError && (
        <div role="alert" className="inline-error mb-6">
          {submissionError}
        </div>
      )}

      {isSubmitting ? (
        <div role="status" className="my-16 flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-slate-800">
            {t('جارٍ حفظ إجاباتك بأمان...', 'Safely saving your responses...')}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {t('يرجى الانتظار لحظات قليلة', 'Please hold on for a moment')}
          </p>
        </div>
      ) : (
        <>
          {step === 'instructions' && (
            <InstructionsView onStart={() => setStep('demographics')} />
          )}

          {step === 'demographics' && (
            <DemographicsForm
              initialValues={demographics}
              onSubmit={handleDemographicsSubmit}
              onBack={() => setStep('instructions')}
            />
          )}

          {/* Domain 1: Anxiety (Items 1-13) */}
          {step === 'domain-0' && (
            <DomainSection
              domain={DOMAINS[0]}
              items={ITEMS}
              responses={responses}
              onSelectResponse={handleSelectResponse}
              onNext={() => setStep('domain-1')}
              onPrev={() => setStep('demographics')}
              isFirstDomain={true}
              isLastDomain={false}
              domainIndex={0}
              totalDomains={5}
            />
          )}

          {/* Domain 2: Depression (Items 14-27) */}
          {step === 'domain-1' && (
            <DomainSection
              domain={DOMAINS[1]}
              items={ITEMS}
              responses={responses}
              onSelectResponse={handleSelectResponse}
              onNext={() => setStep('domain-2')}
              onPrev={() => setStep('domain-0')}
              isFirstDomain={false}
              isLastDomain={false}
              domainIndex={1}
              totalDomains={5}
            />
          )}

          {/* Domain 3: Behavior & Discipline (Items 28-39) */}
          {step === 'domain-2' && (
            <DomainSection
              domain={DOMAINS[2]}
              items={ITEMS}
              responses={responses}
              onSelectResponse={handleSelectResponse}
              onNext={() => setStep('domain-3')}
              onPrev={() => setStep('domain-1')}
              isFirstDomain={false}
              isLastDomain={false}
              domainIndex={2}
              totalDomains={5}
            />
          )}

          {/* Domain 4: Self-Harm / Suicidal Ideation (Items 40-49) */}
          {step === 'domain-3' && (
            <DomainSection
              domain={DOMAINS[3]}
              items={ITEMS}
              responses={responses}
              onSelectResponse={handleSelectResponse}
              onNext={() => setStep('safety-notice')}
              onPrev={() => setStep('domain-2')}
              isFirstDomain={false}
              isLastDomain={false}
              domainIndex={3}
              totalDomains={5}
            />
          )}

          {/* Mandatory In-App Safety Notice Screen after Domain 4 before Domain 5 */}
          {step === 'safety-notice' && (
            <SafetyNoticeStep onAcknowledge={() => setStep('domain-4')} />
          )}

          {/* Domain 5: School Maladjustment (Items 50-61) */}
          {step === 'domain-4' && (
            <DomainSection
              domain={DOMAINS[4]}
              items={ITEMS}
              responses={responses}
              onSelectResponse={handleSelectResponse}
              onNext={handleSubmitAssessment}
              onPrev={() => setStep('domain-3')}
              isFirstDomain={false}
              isLastDomain={true}
              domainIndex={4}
              totalDomains={5}
            />
          )}

          {step === 'success' && completedAssessmentId && (
            <SubmissionSuccess
              assessmentId={completedAssessmentId}
              onReset={resetFlow}
            />
          )}
        </>
      )}

    </div>
  );
};
