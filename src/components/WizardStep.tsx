import React from 'react';
import { SelectionCard } from './SelectionCard';
import { ThemePreview } from './ThemePreview';

interface Option {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface WizardStepProps {
  title: string;
  subtitle?: string;
  options: Option[];
  selectedOptions: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  multiSelect?: boolean;
  showThemePreviews?: boolean;
}

export const WizardStep: React.FC<WizardStepProps> = ({
  title,
  subtitle,
  options,
  selectedOptions,
  onSelectionChange,
  multiSelect = true,
  showThemePreviews = false
}) => {
  const handleSelect = (id: string) => {
    if (multiSelect) {
      const newSelection = selectedOptions.includes(id)
        ? selectedOptions.filter(optionId => optionId !== id)
        : [...selectedOptions, id];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([id]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((option) => (
          <div key={option.id} className="space-y-4">
            <SelectionCard
              id={option.id}
              title={option.title}
              description={option.description}
              icon={option.icon}
              selected={selectedOptions.includes(option.id)}
              onSelect={handleSelect}
            />
            {showThemePreviews && (
              <div className="flex justify-center">
                <ThemePreview themeId={option.id} />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {multiSelect && (
        <div className="text-center text-sm text-muted-foreground">
          Select multiple options by clicking on the cards
        </div>
      )}
    </div>
  );
};