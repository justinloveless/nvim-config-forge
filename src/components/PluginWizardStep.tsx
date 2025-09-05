import React, { useState } from 'react';
import { WizardStep } from './WizardStep';
import { PluginSearch } from './PluginSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Option {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface PluginWizardStepProps {
  title: string;
  subtitle?: string;
  options: Option[];
  selectedOptions: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  customPlugins?: Option[];
  onCustomPluginAdd?: (plugin: Option) => void;
}

export const PluginWizardStep: React.FC<PluginWizardStepProps> = ({
  title,
  subtitle,
  options,
  selectedOptions,
  onSelectionChange,
  customPlugins = [],
  onCustomPluginAdd
}) => {
  const [activeTab, setActiveTab] = useState('essential');

  // Combine built-in and custom plugins
  const allPlugins = [...options, ...customPlugins];

  const handlePluginAdd = (plugin: { id: string; title: string; description: string }) => {
    if (onCustomPluginAdd) {
      onCustomPluginAdd({
        id: plugin.id,
        title: plugin.title,
        description: plugin.description,
        icon: <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">C</div>
      });
    }
  };

  const essentialCount = options.filter(plugin => selectedOptions.includes(plugin.id)).length;
  const customCount = customPlugins.filter(plugin => selectedOptions.includes(plugin.id)).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Plugin Selection Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="essential" className="flex items-center gap-2">
            Essential Plugins
            {essentialCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {essentialCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="discover" className="flex items-center gap-2">
            Discover More
            {customCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {customCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="essential" className="mt-8">
          <WizardStep
            title=""
            subtitle=""
            options={options}
            selectedOptions={selectedOptions}
            onSelectionChange={onSelectionChange}
            multiSelect={true}
            hideHeader={true}
          />
        </TabsContent>

        <TabsContent value="discover" className="mt-8 space-y-6">
          {/* Custom Plugins Grid */}
          {customPlugins.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center">Your Custom Plugins</h3>
              <WizardStep
                title=""
                subtitle=""
                options={customPlugins}
                selectedOptions={selectedOptions}
                onSelectionChange={onSelectionChange}
                multiSelect={true}
                hideHeader={true}
              />
            </div>
          )}

          {/* Plugin Search */}
          <PluginSearch
            selectedPlugins={selectedOptions}
            onPluginAdd={handlePluginAdd}
          />
        </TabsContent>
      </Tabs>

      {/* Selection Summary */}
      {selectedOptions.length > 0 && (
        <div className="text-center p-4 bg-muted/30 rounded-lg border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{selectedOptions.length}</span> plugins selected
            {essentialCount > 0 && customCount > 0 && (
              <span>
                {' '}({essentialCount} essential, {customCount} custom)
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};