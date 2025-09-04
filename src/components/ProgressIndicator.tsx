import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps
}) => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                index < currentStep && "bg-nvim-green text-background",
                index === currentStep && "bg-nvim-blue text-background ring-2 ring-nvim-blue/30",
                index > currentStep && "bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-16 h-1 mx-4 rounded-full transition-all duration-300",
                index < currentStep ? "bg-nvim-green" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}: {steps[currentStep]}
        </p>
      </div>
    </div>
  );
};