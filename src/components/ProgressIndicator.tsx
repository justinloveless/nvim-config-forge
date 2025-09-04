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
      <div className="hidden md:flex items-center justify-center flex-wrap gap-3 mb-4">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <button
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
                "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-nvim-blue/50",
                onStepClick && "cursor-pointer",
                !onStepClick && "cursor-default",
                index < currentStep && "bg-nvim-green text-background shadow-sm hover:bg-nvim-green/90",
                index === currentStep && "bg-nvim-blue text-background ring-2 ring-nvim-blue/30 shadow-md",
                index > currentStep && "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {step}
            </button>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-8 h-0.5 rounded-full transition-all duration-300 hidden lg:block",
                index < currentStep ? "bg-nvim-green" : "bg-muted"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Mobile layout */}
      <div className="md:hidden">
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 px-4">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex-shrink-0 whitespace-nowrap",
                  "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-nvim-blue/50",
                  onStepClick && "cursor-pointer",
                  !onStepClick && "cursor-default",
                  index < currentStep && "bg-nvim-green text-background shadow-sm",
                  index === currentStep && "bg-nvim-blue text-background ring-2 ring-nvim-blue/30 shadow-md",
                  index > currentStep && "bg-muted text-muted-foreground"
                )}
              >
                {step}
              </button>
            ))}
          </div>
        </div>
        <div className="w-full bg-muted h-1 rounded-full mx-4">
          <div 
            className="h-full bg-gradient-primary rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};