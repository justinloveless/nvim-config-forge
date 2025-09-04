import React from 'react';
import { cn } from '@/lib/utils';

interface SelectionCardProps {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onSelect: (id: string) => void;
  className?: string;
  themePreview?: React.ReactNode;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  id,
  title,
  description,
  icon,
  selected = false,
  onSelect,
  className,
  themePreview
}) => {
  return (
    <div
      onClick={() => onSelect(id)}
      className={cn(
        "relative p-6 rounded-lg border cursor-pointer transition-all duration-300",
        "bg-gradient-card shadow-card hover:shadow-selected",
        "border-border hover:border-nvim-green/50",
        selected && [
          "border-nvim-green shadow-selected",
          "bg-gradient-selected",
          "ring-1 ring-nvim-green/30"
        ],
        className
      )}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className={cn(
            "flex-shrink-0 p-2 rounded-md transition-colors",
            selected ? "bg-nvim-green/20 text-nvim-green" : "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold text-lg mb-2 transition-colors",
            selected ? "text-nvim-green" : "text-foreground"
          )}>
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      {themePreview && (
        <div className="mt-4 flex justify-center">
          {themePreview}
        </div>
      )}
      
      {selected && (
        <div className="absolute top-3 right-3">
          <div className="w-5 h-5 rounded-full bg-nvim-green flex items-center justify-center">
            <svg className="w-3 h-3 text-background" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};