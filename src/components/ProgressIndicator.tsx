import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  onStepClick?: (stepIndex: number) => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps,
  onStepClick
}) => {
  return (
    <div className="mb-6 md:mb-12 sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/10 py-4">
      {/* Desktop layout */}
      <div className="hidden md:flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <button
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-nvim-blue/50",
                onStepClick && "cursor-pointer",
                !onStepClick && "cursor-default",
                index < currentStep && "bg-nvim-green text-background shadow-sm hover:bg-nvim-green/90",
                index === currentStep && "bg-nvim-blue text-background ring-2 ring-nvim-blue/30 shadow-md",
                index > currentStep && "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </button>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-16 h-1 mx-4 rounded-full transition-all duration-300",
                index < currentStep ? "bg-nvim-green" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>
      
      {/* Mobile layout */}
      <div className="md:hidden">
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 flex-shrink-0",
                  "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-nvim-blue/50",
                  onStepClick && "cursor-pointer",
                  !onStepClick && "cursor-default",
                  index < currentStep && "bg-nvim-green text-background shadow-sm",
                  index === currentStep && "bg-nvim-blue text-background ring-2 ring-nvim-blue/30 shadow-md",
                  index > currentStep && "bg-muted text-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="w-full bg-muted h-1 rounded-full">
          <div 
            className="h-full bg-gradient-primary rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="text-center mt-3">
        <p className="text-sm text-muted-foreground">
          <span className="md:hidden">
            Step {currentStep + 1}/{totalSteps}: 
          </span>
          <span className="hidden md:inline">
            Step {currentStep + 1} of {totalSteps}: 
          </span>
          <span className="font-medium text-foreground">{steps[currentStep]}</span>
        </p>
      </div>
    </div>
  );
};