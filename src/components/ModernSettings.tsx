import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, RotateCcw, Info, RotateCcw as ResetIcon, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SETTINGS_CATEGORIES } from '@/data/settingsConfig';
import { SettingsConfig, SettingDefinition } from '@/types/settings';
import { getNvimOptions, setNvimOption } from '@/utils/nvimListener';
import { useToast } from '@/hooks/use-toast';

interface NvimOption {
  name: string;
  value: any;
  type: 'boolean' | 'number' | 'string' | 'array';
  scope: 'global' | 'local' | 'window' | 'buffer';
  description?: string;
  default?: any;
}

interface ModernSettingsProps {
  settings: SettingsConfig;
  onSettingsChange: (newSettings: SettingsConfig) => void;
  selectedPlugins: string[];
  isNvimConnected?: boolean;
  nvimConfig?: { port: number; token?: string };
}

export const ModernSettings: React.FC<ModernSettingsProps> = ({
  settings,
  onSettingsChange,
  selectedPlugins,
  isNvimConnected = false,
  nvimConfig
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('editor');
  const [nvimOptions, setNvimOptions] = useState<NvimOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const { toast } = useToast();
  
  
  // Fetch Neovim options when connected
  const fetchNvimOptions = async () => {
    if (!isNvimConnected || !nvimConfig) return;
    
    setLoadingOptions(true);
    try {
      const response = await getNvimOptions(nvimConfig);
      if (response.success && response.options) {
        setNvimOptions(response.options);
      } else {
        toast({
          title: "Failed to fetch Neovim options",
          description: response.message || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error fetching options",
        description: "Failed to connect to Neovim",
        variant: "destructive",
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (isNvimConnected) {
      fetchNvimOptions();
    } else {
      setNvimOptions([]);
    }
  }, [isNvimConnected, nvimConfig?.port, nvimConfig?.token]);

  // Handle Neovim option changes
  const handleNvimOptionChange = async (optionName: string, value: any) => {
    if (!nvimConfig) return;
    
    try {
      const response = await setNvimOption(optionName, value, nvimConfig);
      if (response.success) {
        // Update local state
        setNvimOptions(prev => prev.map(opt => 
          opt.name === optionName ? { ...opt, value } : opt
        ));
        toast({
          title: "Option updated",
          description: `${optionName} set to ${value}`,
        });
      } else {
        toast({
          title: "Failed to update option",
          description: response.message || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error updating option",
        description: "Failed to update Neovim option",
        variant: "destructive",
      });
    }
  };

  // Filter settings within each category
  const getVisibleSettings = (categorySettings: SettingDefinition[]) => {
    return categorySettings.filter(setting => {
      // Check plugin requirements
      if (setting.requiresPlugins && 
          !setting.requiresPlugins.some(plugin => selectedPlugins.includes(plugin))) {
        return false;
      }
      
      // Check dependencies
      if (setting.dependsOn) {
        const dependsOnValue = getNestedValue(settings, setting.dependsOn);
        if (!dependsOnValue) return false;
      }
      
      // Check search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return setting.title.toLowerCase().includes(searchLower) ||
               setting.description.toLowerCase().includes(searchLower);
      }
      
      return true;
    });
  };
  
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };
   
  // Filter categories based on selected plugins and search results
  const visibleCategories = useMemo(() => {
    return SETTINGS_CATEGORIES.filter(category => {
      // Check if category has any visible settings after all filters
      const visibleSettings = getVisibleSettings(category.settings);
      return visibleSettings.length > 0;
    });
  }, [selectedPlugins, searchQuery, settings]);
  
  const setNestedValue = (obj: any, path: string, value: any): any => {
    const keys = path.split('.');
    const result = { ...obj };
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      current[key] = { ...current[key] };
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    return result;
  };
  
  const handleSettingChange = (settingId: string, value: any) => {
    const newSettings = setNestedValue(settings, settingId, value);
    onSettingsChange(newSettings);
  };

  const getSettingDefaultValue = (settingId: string): any => {
    for (const category of SETTINGS_CATEGORIES) {
      const setting = category.settings.find(s => s.id === settingId);
      if (setting) {
        return setting.defaultValue;
      }
    }
    return undefined;
  };

  const isSettingChanged = (settingId: string): boolean => {
    const currentValue = getNestedValue(settings, settingId);
    const defaultValue = getSettingDefaultValue(settingId);
    
    // Handle array comparison for ignored patterns
    if (Array.isArray(currentValue) && Array.isArray(defaultValue)) {
      return JSON.stringify(currentValue.sort()) !== JSON.stringify(defaultValue.sort());
    }
    
    return currentValue !== defaultValue;
  };

  const resetSingleSetting = (settingId: string) => {
    const defaultValue = getSettingDefaultValue(settingId);
    handleSettingChange(settingId, defaultValue);
  };
  
  const resetToDefaults = () => {
    const defaultSettings: SettingsConfig = {
      indentSize: 2,
      lineWrapping: false,
      lineNumbers: 'both',
      showWhitespace: false,
      cursorLine: true,
      colorColumn: null,
      scrollOffset: 8,
      autoSave: false,
      autoSaveDelay: 1000,
      undoLevels: 1000,
      smartCase: true,
      ignoreCase: true,
      splitDirection: 'below',
      showSignColumn: true,
      showFoldColumn: false,
      terminalPosition: 'horizontal',
      completion: 'advanced',
      updateTime: 250,
      timeoutLength: 300,
      lazyRedraw: false,
      telescope: {
        previewEnabled: true,
        historyLimit: 100,
        ignoredPatterns: ['*.git*', 'node_modules/*', '*.lock']
      },
      nvimTree: {
        width: 30,
        autoClose: false,
        followCurrentFile: true,
        gitIntegration: true
      },
      lualine: {
        theme: 'auto',
        showFileEncoding: false,
        showFileType: true,
        showBranch: true
      },
      treesitter: {
        autoInstall: true,
        highlightEnabled: true,
        indentEnabled: true,
        foldingEnabled: false
      },
      debugging: {
        autoOpenUI: true,
        showInlineVariables: true,
        breakOnException: false
      },
      git: {
        showLineBlame: false,
        showDiffInSigns: true,
        wordDiff: false
      }
    };
    
    onSettingsChange(defaultSettings);
  };
  
  const renderSettingControl = (setting: SettingDefinition) => {
    const currentValue = getNestedValue(settings, setting.id);
    
    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={currentValue || false}
            onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
          />
        );
        
      case 'number':
        if (setting.min !== undefined && setting.max !== undefined) {
          return (
            <div className="space-y-3">
              <Slider
                value={[currentValue || setting.defaultValue]}
                onValueChange={(values) => handleSettingChange(setting.id, values[0])}
                min={setting.min}
                max={setting.max}
                step={setting.step || 1}
                className="w-full"
              />
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{setting.min}{setting.unit && ` ${setting.unit}`}</span>
                <Input
                  type="number"
                  value={currentValue || setting.defaultValue}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= setting.min! && value <= setting.max!) {
                      handleSettingChange(setting.id, value);
                    }
                  }}
                  min={setting.min}
                  max={setting.max}
                  step={setting.step || 1}
                  className="w-20 h-8 text-center text-sm font-medium text-foreground"
                />
                <span>{setting.max}{setting.unit && ` ${setting.unit}`}</span>
              </div>
            </div>
          );
        } else {
          return (
            <Input
              type="number"
              value={currentValue || setting.defaultValue}
              onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value) || setting.defaultValue)}
              min={setting.min}
              max={setting.max}
              step={setting.step || 1}
            />
          );
        }
        
      case 'select':
        return (
          <Select
            value={currentValue || setting.defaultValue}
            onValueChange={(value) => handleSettingChange(setting.id, value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div>{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'text':
        if (setting.id.includes('ignoredPatterns')) {
          return (
            <Textarea
              value={Array.isArray(currentValue) ? currentValue.join(',') : currentValue || setting.defaultValue}
              onChange={(e) => {
                const value = e.target.value;
                const array = value.split(',').map(s => s.trim()).filter(Boolean);
                handleSettingChange(setting.id, array);
              }}
              placeholder={setting.placeholder}
              rows={3}
            />
          );
        } else {
          return (
            <Input
              value={currentValue || setting.defaultValue}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
              placeholder={setting.placeholder}
            />
          );
        }
        
      default:
        return null;
    }
  };
  
  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Editor Settings</h2>
              <p className="text-muted-foreground">
                Customize your Neovim experience with these comprehensive settings
              </p>
            </div>
            <Button
              onClick={resetToDefaults}
              variant="outline"
              size="sm"
              className="w-fit"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Mobile Category Dropdown */}
        <div className="block lg:hidden mb-6">
          <Label className="text-sm font-medium mb-2 block">Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                {selectedCategory === 'nvim-live' ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  visibleCategories.find(cat => cat.id === selectedCategory)?.icon
                )}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {visibleCategories.map((category) => {
                const visibleSettingsCount = getVisibleSettings(category.settings).length;
                
                return (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <div>
                        <div className="font-medium">{category.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {visibleSettingsCount} setting{visibleSettingsCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
              
              {/* Live Neovim Options Category */}
              {isNvimConnected && nvimOptions.length > 0 && (
                <SelectItem value="nvim-live">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Live Neovim Options</div>
                      <div className="text-xs text-muted-foreground">
                        {nvimOptions.length} live options
                      </div>
                    </div>
                  </div>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar - Hidden on Mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Categories</CardTitle>
                {isNvimConnected && (
                  <div className="flex items-center gap-2 text-sm">
                    <Wifi className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Live Neovim Options</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-1">
                {visibleCategories.map((category) => {
                  const visibleSettingsCount = getVisibleSettings(category.settings).length;
                  
                  if (!visibleSettingsCount && searchQuery.trim()) return null;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors",
                        selectedCategory === category.id
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "hover:bg-muted/50"
                      )}
                    >
                      {category.icon}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{category.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {visibleSettingsCount} setting{visibleSettingsCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </button>
                  );
                })}
                
                {/* Live Neovim Options Category */}
                {isNvimConnected && nvimOptions.length > 0 && (
                  <button
                    onClick={() => setSelectedCategory('nvim-live')}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors",
                      selectedCategory === 'nvim-live'
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <Wifi className="w-5 h-5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">Live Neovim Options</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {nvimOptions.length} live options
                      </div>
                    </div>
                  </button>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Settings Content */}
          <div className="col-span-1 lg:col-span-3">
            {selectedCategory === 'nvim-live' ? (
              /* Live Neovim Options */
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wifi className="w-5 h-5" />
                      <div>
                        <CardTitle>Live Neovim Options</CardTitle>
                        <CardDescription>
                          Current options from your running Neovim instance
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      onClick={fetchNvimOptions}
                      variant="outline"
                      size="sm"
                      disabled={loadingOptions}
                    >
                      <RefreshCw className={cn("w-4 h-4 mr-2", loadingOptions && "animate-spin")} />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {nvimOptions
                      .filter(option => {
                        if (!searchQuery.trim()) return true;
                        const query = searchQuery.toLowerCase();
                        return option.name.toLowerCase().includes(query) ||
                               (option.description && option.description.toLowerCase().includes(query));
                      })
                      .map((option) => (
                        <div key={option.name} className="flex items-start gap-6">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="font-medium text-base font-mono">
                                {option.name}
                              </Label>
                              <Badge variant="outline" className="text-xs">
                                {option.scope}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {option.type}
                              </Badge>
                            </div>
                            {option.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {option.description}
                              </p>
                            )}
                          </div>
                          <div className="w-56 flex-shrink-0">
                            {option.type === 'boolean' ? (
                              <Switch
                                checked={option.value || false}
                                onCheckedChange={(checked) => handleNvimOptionChange(option.name, checked)}
                              />
                            ) : option.type === 'number' ? (
                              <Input
                                type="number"
                                value={option.value || 0}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  handleNvimOptionChange(option.name, value);
                                }}
                              />
                            ) : option.type === 'array' ? (
                              <Textarea
                                value={Array.isArray(option.value) ? option.value.join(',') : option.value || ''}
                                onChange={(e) => {
                                  const value = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                  handleNvimOptionChange(option.name, value);
                                }}
                                rows={2}
                              />
                            ) : (
                              <Input
                                value={option.value || ''}
                                onChange={(e) => handleNvimOptionChange(option.name, e.target.value)}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Standard Settings Categories */
              visibleCategories.find(cat => cat.id === selectedCategory) && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {visibleCategories.find(cat => cat.id === selectedCategory)?.icon}
                      <div>
                        <CardTitle>
                          {visibleCategories.find(cat => cat.id === selectedCategory)?.title}
                        </CardTitle>
                        <CardDescription>
                          {visibleCategories.find(cat => cat.id === selectedCategory)?.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {getVisibleSettings(
                      visibleCategories.find(cat => cat.id === selectedCategory)?.settings || []
                    ).map((setting, index) => (
                      <div key={setting.id}>
                        <div className="flex items-start gap-6">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="font-medium text-base">
                                {setting.title}
                              </Label>
                              {setting.requiresPlugins && (
                                <Badge variant="secondary" className="text-xs">
                                  Plugin: {setting.requiresPlugins.join(', ')}
                                </Badge>
                              )}
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-4 h-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{setting.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {setting.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-56 flex-shrink-0">
                              {renderSettingControl(setting)}
                            </div>
                            <div className="w-8 flex justify-center flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => resetSingleSetting(setting.id)}
                                className={cn(
                                  "h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-opacity",
                                  isSettingChanged(setting.id) ? "opacity-100" : "opacity-0 pointer-events-none"
                                )}
                                title={`Reset ${setting.title} to default`}
                              >
                                <ResetIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {index < getVisibleSettings(
                          visibleCategories.find(cat => cat.id === selectedCategory)?.settings || []
                        ).length - 1 && <Separator className="mt-8" />}
                      </div>
                    ))}
                  </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};