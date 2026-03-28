import { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProcessingStateProps {
  onComplete: () => void;
}

const processingSteps = [
  'Upload complete',
  'Transcription in progress',
  'Calls analyzed',
  'Clustering scenarios',
  'Generating flows',
];

export function ProcessingState({ onComplete }: ProcessingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [processed, setProcessed] = useState(0);
  const totalCalls = 87;

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(stepInterval);
          setTimeout(onComplete, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);

    const countInterval = setInterval(() => {
      setProcessed((prev) => {
        if (prev >= totalCalls) {
          clearInterval(countInterval);
          return totalCalls;
        }
        return prev + Math.floor(Math.random() * 4) + 1;
      });
    }, 300);

    return () => {
      clearInterval(stepInterval);
      clearInterval(countInterval);
    };
  }, [onComplete]);

  const progressPercent = Math.min(
    ((currentStep + 1) / processingSteps.length) * 100,
    100
  );

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
            <Loader2 className="h-8 w-8 text-secondary animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Analyzing your recordings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {Math.min(processed, totalCalls)}/{totalCalls} calls processed
          </p>
        </div>

        <Progress value={progressPercent} className="h-2" />

        <div className="space-y-3 text-left">
          {processingSteps.map((step, i) => (
            <div
              key={step}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all',
                i < currentStep
                  ? 'text-foreground'
                  : i === currentStep
                  ? 'bg-secondary/5 text-foreground font-medium'
                  : 'text-muted-foreground/50'
              )}
            >
              {i < currentStep ? (
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : i === currentStep ? (
                <Loader2 className="h-4 w-4 text-secondary animate-spin shrink-0" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-border shrink-0" />
              )}
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
