import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { WizardStep } from '@/components/WizardStep';
import ModernKeymaps from '@/components/ModernKeymaps';
import { ModernSettings } from '@/components/ModernSettings';
import { generateInitLua, downloadFile, downloadToDirectory } from '@/utils/configGenerator';
import { getDefaultSettingsConfig } from '@/utils/settingsConfigGenerator';
import { SettingsConfig } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';
import { PresetStacks } from '@/components/PresetStacks';
import { InstallerScripts } from '@/components/InstallerScripts';
import { HealthCheckAnalyzer } from '@/components/HealthCheckAnalyzer';
import { ConfigImporter } from '@/components/ConfigImporter';
import { BuyMeCoffeeButton } from '@/components/BuyMeCoffeeButton';
import { GenerateActions } from '@/components/GenerateActions';
import { connectDirectory, writeToConnectedDirectory, hasDirectoryConnection } from '@/utils/dirHandleStore';
import { detectNvimListener, saveToNvim } from '@/utils/nvimListener';
import { Code, Palette, Plug, Settings, Download, FileText, Copy, Check, Zap, Wrench, FileUp, Folder, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NvimConfig {
  languages: string[];
  theme: string;
  plugins: string[];
  settings: string[];
  settingsConfig?: SettingsConfig;
  leaderKey: string;
  keymaps: { [key: string]: string };
  downloadDir?: string;
  nvimListenerEnabled?: boolean;
  nvimListenerPort?: number;
  nvimListenerToken?: string;
}

const STEPS = [
  'Quick Start',
  'Languages', 
  'Theme',
  'Plugins',
  'Settings',
  'Keymaps',
  'Generate'
];

const LANGUAGE_OPTIONS = [
  { id: 'typescript', title: 'TypeScript', description: 'Strongly typed JavaScript with advanced tooling', icon: <Code className="w-5 h-5" /> },
  { id: 'javascript', title: 'JavaScript', description: 'Dynamic scripting language for web development', icon: <Code className="w-5 h-5" /> },
  { id: 'python', title: 'Python', description: 'Versatile language for scripting and data science', icon: <Code className="w-5 h-5" /> },
  { id: 'rust', title: 'Rust', description: 'Systems programming language focused on safety', icon: <Code className="w-5 h-5" /> },
  { id: 'go', title: 'Go', description: 'Simple, fast, and reliable language for servers', icon: <Code className="w-5 h-5" /> },
  { id: 'c', title: 'C', description: 'Low-level programming language', icon: <Code className="w-5 h-5" /> },
  { id: 'cpp', title: 'C++', description: 'Object-oriented extension of C', icon: <Code className="w-5 h-5" /> },
  { id: 'csharp', title: 'C#', description: 'Microsoft\'s object-oriented language', icon: <Code className="w-5 h-5" /> },
  { id: 'java', title: 'Java', description: 'Enterprise-grade object-oriented language', icon: <Code className="w-5 h-5" /> },
  { id: 'lua', title: 'Lua', description: 'Lightweight scripting language (for Neovim config)', icon: <Code className="w-5 h-5" /> },
];

const THEME_OPTIONS = [
  { id: 'catppuccin', title: 'Catppuccin', description: 'Soothing pastel theme with excellent contrast', icon: <Palette className="w-5 h-5" /> },
  { id: 'gruvbox', title: 'Gruvbox', description: 'Retro groove color scheme with warm colors', icon: <Palette className="w-5 h-5" /> },
  { id: 'tokyonight', title: 'Tokyo Night', description: 'Clean dark theme inspired by Tokyo\'s night', icon: <Palette className="w-5 h-5" /> },
  { id: 'nord', title: 'Nord', description: 'Arctic, north-bluish color palette', icon: <Palette className="w-5 h-5" /> },
  { id: 'onedark', title: 'One Dark', description: 'Atom\'s iconic One Dark theme', icon: <Palette className="w-5 h-5" /> },
  { id: 'default', title: 'Default', description: 'Keep Neovim\'s default color scheme', icon: <Palette className="w-5 h-5" /> },
];

const PLUGIN_OPTIONS = [
  { id: 'treesitter', title: 'TreeSitter', description: 'Advanced syntax highlighting and code parsing', icon: <Plug className="w-5 h-5" /> },
  { id: 'telescope', title: 'Telescope', description: 'Fuzzy finder for files, buffers, and more', icon: <Plug className="w-5 h-5" /> },
  { id: 'nvim-tree', title: 'NvimTree', description: 'File explorer sidebar', icon: <Plug className="w-5 h-5" /> },
  { id: 'tabbufline', title: 'Tabbufline', description: 'Enhanced tab and buffer management with NvChad UI', icon: <Plug className="w-5 h-5" /> },
  { id: 'dashboard', title: 'Dashboard', description: 'Fancy start screen with quick access options', icon: <Plug className="w-5 h-5" /> },
  { id: 'indent-blankline', title: 'Indent Blankline', description: 'Visual indentation guides', icon: <Plug className="w-5 h-5" /> },
  { id: 'lualine', title: 'Lualine', description: 'Fast and customizable statusline', icon: <Plug className="w-5 h-5" /> },
  { id: 'nvim-surround', title: 'nvim-surround', description: 'Surround text with brackets, quotes, etc.', icon: <Plug className="w-5 h-5" /> },
  { id: 'gitsigns', title: 'GitSigns', description: 'Git integration with line-by-line changes', icon: <Plug className="w-5 h-5" /> },
  { id: 'which-key', title: 'Which Key', description: 'Display available keybindings in popup', icon: <Plug className="w-5 h-5" /> },
  { id: 'nvim-dap', title: 'nvim-dap', description: 'Debug adapter protocol client', icon: <Plug className="w-5 h-5" /> },
  { id: 'nvim-notify', title: 'nvim-notify', description: 'Enhanced notification system', icon: <Plug className="w-5 h-5" /> },
];

const SETTINGS_OPTIONS = [
  { id: 'line_numbers', title: 'Line Numbers', description: 'Show line numbers and relative line numbers', icon: <Settings className="w-5 h-5" /> },
  { id: 'auto_save', title: 'Auto Save', description: 'Automatically save files when modified', icon: <Settings className="w-5 h-5" /> },
  { id: 'wrap_text', title: 'Text Wrapping', description: 'Wrap long lines for better readability', icon: <Settings className="w-5 h-5" /> },
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<NvimConfig>({
    languages: [],
    theme: '',
    plugins: [],
    settings: [],
    settingsConfig: getDefaultSettingsConfig(),
    leaderKey: ' ',
    keymaps: {},
    downloadDir: '',
    nvimListenerEnabled: false,
    nvimListenerPort: 45831,
    nvimListenerToken: ''
  });
  const [generatedConfig, setGeneratedConfig] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState<{ [key: string]: boolean }>({});
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasDirectoryHandle, setHasDirectoryHandle] = useState(false);
  const [nvimListenerConnected, setNvimListenerConnected] = useState(false);
  const { toast } = useToast();

  // URL state management
  const updateURL = (step: number, newConfig: NvimConfig) => {
    const params = new URLSearchParams();
    params.set('step', step.toString());
    if (newConfig.languages.length > 0) params.set('languages', newConfig.languages.join(','));
    if (newConfig.theme) params.set('theme', newConfig.theme);
    if (newConfig.plugins.length > 0) params.set('plugins', newConfig.plugins.join(','));
    if (newConfig.settings.length > 0) params.set('settings', newConfig.settings.join(','));
    if (newConfig.leaderKey !== ' ') params.set('leaderKey', newConfig.leaderKey);
    if (newConfig.downloadDir) params.set('downloadDir', newConfig.downloadDir);
    if (Object.keys(newConfig.keymaps).length > 0) {
      params.set('keymaps', JSON.stringify(newConfig.keymaps));
    }
    // Persist listener state (no token) for convenience
    if (newConfig.nvimListenerEnabled) {
      params.set('nvimListener', '1');
      if (newConfig.nvimListenerPort) params.set('nvimPort', String(newConfig.nvimListenerPort));
    }
    
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newURL);
  };

  const loadFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const step = parseInt(params.get('step') || '0');
    const languages = params.get('languages')?.split(',').filter(Boolean) || [];
    const theme = params.get('theme') || '';
    const plugins = params.get('plugins')?.split(',').filter(Boolean) || [];
    const settings = params.get('settings')?.split(',').filter(Boolean) || [];
    const leaderKey = params.get('leaderKey') || ' ';
    const downloadDir = params.get('downloadDir') || '';
    const nvimListenerEnabled = params.get('nvimListener') === '1';
    const nvimListenerPort = parseInt(params.get('nvimPort') || '') || 45831;
    
    let keymaps = {} as Record<string, string>;
    try {
      const keymapsParam = params.get('keymaps');
      if (keymapsParam) {
        keymaps = JSON.parse(keymapsParam);
      }
    } catch (e) {
      console.warn('Failed to parse keymaps from URL:', e);
    }

    const defaults: NvimConfig = {
      languages: [],
      theme: '',
      plugins: [],
      settings: [],
      settingsConfig: getDefaultSettingsConfig(),
      leaderKey: ' ',
      keymaps: {},
      downloadDir: '',
      nvimListenerEnabled: false,
      nvimListenerPort: 45831,
      nvimListenerToken: ''
    };

    const newConfig: NvimConfig = { 
      ...defaults,
      languages, 
      theme, 
      plugins, 
      settings, 
      settingsConfig: getDefaultSettingsConfig(), 
      leaderKey, 
      keymaps,
      downloadDir,
      nvimListenerEnabled,
      nvimListenerPort
    };
    setCurrentStep(step);
    setConfig(newConfig);
    
    // Generate config if on final step
    if (step === STEPS.length - 1) {
      const generated = generateInitLua(newConfig);
      setGeneratedConfig(generated);
    }
  };

  // Load state from URL on component mount
  useEffect(() => {
    loadFromURL();
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      loadFromURL();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check directory handle on mount
  useEffect(() => {
    const checkDirectoryHandle = async () => {
      const hasConnection = await hasDirectoryConnection();
      setHasDirectoryHandle(hasConnection);
    };
    checkDirectoryHandle();
  }, []);

  // Check Neovim listener connection when enabled
  useEffect(() => {
    if (config.nvimListenerEnabled) {
      const checkConnection = async () => {
        const connected = await detectNvimListener({
          port: config.nvimListenerPort || 45831,
          token: config.nvimListenerToken || undefined,
        });
        setNvimListenerConnected(connected);
      };
      checkConnection();
    } else {
      setNvimListenerConnected(false);
    }
  }, [config.nvimListenerEnabled, config.nvimListenerPort, config.nvimListenerToken]);

  // Regenerate config preview whenever options change on the Generate step
  useEffect(() => {
    if (currentStep === STEPS.length - 1) {
      const updated = generateInitLua(config);
      setGeneratedConfig(updated);
    }
  }, [config, currentStep]);

  const CodeBlock: React.FC<{ command: string; id: string }> = ({ command, id }) => {
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(command);
        setCopiedCommands(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
          setCopiedCommands(prev => ({ ...prev, [id]: false }));
        }, 2000);
      } catch (err) {
        console.error('Failed to copy command:', err);
      }
    };

    return (
      <div className="relative group">
        <code className="block bg-background/50 px-3 py-2 rounded text-sm pr-12">
          {command}
        </code>
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copiedCommands[id] ? (
            <Check className="w-3 h-3 text-nvim-green" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </div>
    );
  };

  const handleLanguageChange = (selectedIds: string[]) => {
    const newConfig = { ...config, languages: selectedIds };
    setConfig(newConfig);
    updateURL(currentStep, newConfig);
  };

  const handleThemeChange = (selectedIds: string[]) => {
    const newConfig = { ...config, theme: selectedIds[0] || '' };
    setConfig(newConfig);
    updateURL(currentStep, newConfig);
  };

  const handlePluginChange = (selectedIds: string[]) => {
    const newConfig = { ...config, plugins: selectedIds };
    setConfig(newConfig);
    updateURL(currentStep, newConfig);
  };

  const handleSettingsConfigChange = (newSettingsConfig: SettingsConfig) => {
    const newConfig = { ...config, settingsConfig: newSettingsConfig };
    setConfig(newConfig);
    updateURL(currentStep, newConfig);
  };

  const handleLeaderKeyChange = (leaderKey: string) => {
    const newConfig = { ...config, leaderKey };
    setConfig(newConfig);
    updateURL(currentStep, newConfig);
  };

  const handleKeymapChange = (action: string, keymap: string) => {
    const newConfig = {
      ...config,
      keymaps: { ...config.keymaps, [action]: keymap }
    };
    setConfig(newConfig);
    updateURL(currentStep, newConfig);
  };

  const handleBatchKeymapChange = (newKeymaps: { [action: string]: string }) => {
    const newConfig = {
      ...config,
      keymaps: { ...config.keymaps, ...newKeymaps }
    };
    setConfig(newConfig);
    updateURL(currentStep, newConfig);
  };

  const handleNext = () => {
    const newStep = Math.min(currentStep + 1, STEPS.length - 1);
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (newStep === STEPS.length - 1) {
        // Generate config on the last step
        const generated = generateInitLua(config);
        setGeneratedConfig(generated);
      }
      setCurrentStep(newStep);
      updateURL(newStep, config);
      setIsTransitioning(false);
    }, 150);
  };

  const handleBack = () => {
    const newStep = Math.max(currentStep - 1, 0);
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentStep(newStep);
      updateURL(newStep, config);
      setIsTransitioning(false);
    }, 150);
  };

  const handleStepClick = (stepIndex: number) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentStep(stepIndex);
      if (stepIndex === STEPS.length - 1) {
        // Generate config on the last step
        const generated = generateInitLua(config);
        setGeneratedConfig(generated);
      }
      updateURL(stepIndex, config);
      setIsTransitioning(false);
    }, 150);
  };

  const handleDownload = async () => {
    // Try Neovim listener first if enabled and connected
    if (config.nvimListenerEnabled && nvimListenerConnected) {
      const nvimResult = await saveToNvim(generatedConfig, 'init.lua', {
        port: config.nvimListenerPort || 45831,
        token: config.nvimListenerToken || undefined,
      });
      
      if (nvimResult.success) {
        toast({
          title: "Config updated in Neovim!",
          description: "Your init.lua has been saved and reloaded.",
        });
        return;
      } else {
        toast({
          title: "Neovim save failed",
          description: nvimResult.message || "Falling back to browser download.",
          variant: "destructive",
        });
      }
    }
    
    // Try File System Access API if available
    if (hasDirectoryHandle) {
      const success = await writeToConnectedDirectory('init.lua', generatedConfig);
      if (success) {
        toast({
          title: "File saved successfully!",
          description: "Your init.lua has been saved to the connected directory.",
        });
        return;
      }
    }
    
    // Fallback to regular download with picker if possible
    const result = await downloadToDirectory(generatedConfig, 'init.lua', config.downloadDir);
    
    if (result.method === 'picker') {
      toast({
        title: "File saved successfully!",
        description: "Your init.lua has been saved to the selected location.",
      });
    } else if (result.targetDir) {
      toast({
        title: "Downloaded to Downloads folder",
        description: `Please move the file from Downloads to: ${result.targetDir}`,
        duration: 8000,
      });
    } else {
      toast({
        title: "Downloaded!",
        description: "Your init.lua file has been downloaded.",
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedConfig);
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "Your Neovim configuration has been copied to the clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please select and copy the text manually.",
        variant: "destructive",
      });
    }
  };

  const handleSaveToNvim = async () => {
    if (!config.nvimListenerEnabled || !nvimListenerConnected) {
      toast({
        title: "Neovim listener not available",
        description: "Please ensure the listener is enabled and connected.",
        variant: "destructive",
      });
      return;
    }

    const nvimResult = await saveToNvim(generatedConfig, 'init.lua', {
      port: config.nvimListenerPort || 45831,
      token: config.nvimListenerToken || undefined,
    });
    
    if (nvimResult.success) {
      toast({
        title: "Config updated in Neovim!",
        description: "Your init.lua has been saved and reloaded.",
      });
    } else {
      toast({
        title: "Neovim save failed",
        description: nvimResult.message || "Failed to save to Neovim.",
        variant: "destructive",
      });
    }
  };

  const handleSaveToDirectory = async () => {
    if (!hasDirectoryHandle) {
      toast({
        title: "No directory connected",
        description: "Please connect a directory first.",
        variant: "destructive",
      });
      return;
    }

    const success = await writeToConnectedDirectory('init.lua', generatedConfig);
    if (success) {
      toast({
        title: "File saved successfully!",
        description: "Your init.lua has been saved to the connected directory.",
      });
    } else {
      toast({
        title: "Save failed",
        description: "Failed to save to the connected directory.",
        variant: "destructive",
      });
    }
  };

  const handleApplyPreset = (preset: any) => {
    const presetWithDefaults = { 
      ...preset, 
      settingsConfig: preset.settingsConfig || getDefaultSettingsConfig() 
    };
    setConfig(presetWithDefaults);
    setCurrentStep(1);
    updateURL(1, presetWithDefaults);
    toast({
      title: "Preset Applied!",
      description: "You can now customize this configuration further.",
    });
  };

  const handleImportConfig = (importedConfig: any) => {
    const configWithDefaults = { 
      ...importedConfig, 
      settingsConfig: importedConfig.settingsConfig || getDefaultSettingsConfig() 
    };
    setConfig(configWithDefaults);
    setCurrentStep(1);
    updateURL(1, configWithDefaults);
    toast({
      title: "Configuration Imported!",
      description: "Your existing configuration has been loaded. You can now customize it further.",
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Quick start step
      case 1: return config.languages.length > 0; // Languages step
      case 2: return true; // Theme is optional (can skip)
      case 3: return true; // Plugins are optional
      case 4: return true; // Settings are optional
      case 5: return true; // Keymaps are optional
      default: return true;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PresetStacks onApplyPreset={handleApplyPreset} onImportConfig={handleImportConfig} />
        );
      case 1:
        return (
          <WizardStep
            title="Select Programming Languages"
            subtitle="Choose the languages you'll be working with. This will configure appropriate LSP servers and syntax highlighting."
            options={LANGUAGE_OPTIONS}
            selectedOptions={config.languages}
            onSelectionChange={handleLanguageChange}
            multiSelect={true}
          />
        );
      case 2:
        return (
          <WizardStep
            title="Choose Your Theme"
            subtitle="Pick a color scheme that makes coding enjoyable for your eyes. You can skip this to use the default theme."
            options={THEME_OPTIONS}
            selectedOptions={config.theme ? [config.theme] : []}
            onSelectionChange={handleThemeChange}
            multiSelect={false}
            showThemePreviews={true}
          />
        );
      case 3:
        return (
          <WizardStep
            title="Essential Plugins"
            subtitle="Select plugins to enhance your Neovim experience. LSP servers and completion are automatically included for your selected languages. All selections here are optional."
            options={PLUGIN_OPTIONS}
            selectedOptions={config.plugins}
            onSelectionChange={handlePluginChange}
            multiSelect={true}
          />
        );
      case 4:
        return (
          <ModernSettings
            settings={config.settingsConfig || getDefaultSettingsConfig()}
            onSettingsChange={handleSettingsConfigChange}
            selectedPlugins={config.plugins}
          />
        );
      case 5:
        return (
          <ModernKeymaps
            leaderKey={config.leaderKey}
            keymaps={config.keymaps}
            selectedPlugins={config.plugins}
            onLeaderKeyChange={handleLeaderKeyChange}
            onKeymapChange={handleKeymapChange}
            onBatchKeymapChange={handleBatchKeymapChange}
          />
        );
      case 6:
        return (
          <GenerateActions
            config={config}
            generatedConfig={generatedConfig}
            copied={copied}
            isNvimConnected={nvimListenerConnected}
            hasDirectoryHandle={hasDirectoryHandle}
            onDownload={handleDownload}
            onCopy={handleCopy}
            onSaveToNvim={handleSaveToNvim}
            onSaveToDirectory={handleSaveToDirectory}
            onImportConfig={handleImportConfig}
            onTestConnection={async () => {
              const connected = await detectNvimListener({
                port: config.nvimListenerPort || 45831,
                token: config.nvimListenerToken || undefined,
              });
              setNvimListenerConnected(connected);
              if (connected) {
                toast({
                  title: "Connection successful!",
                  description: "Neovim listener is ready to receive updates.",
                });
              } else {
                toast({
                  title: "Connection failed",
                  description: "Make sure Neovim is running with the HTTP listener enabled.",
                  variant: "destructive",
                });
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card pb-24 relative">
      <div className={cn(
        "container mx-auto px-4 max-w-6xl mb-20",
        currentStep === 0 ? "py-6 md:py-12" : "pt-1 pb-6 md:pt-2 md:pb-12"
      )}>
        {/* Buy me a coffee button - floated at top */}
        <div className="flex justify-end mb-4">
          <BuyMeCoffeeButton />
        </div>

        <div 
          className={cn(
            "text-center transition-all duration-500 ease-out overflow-hidden",
            currentStep === 0 
              ? "mb-8 md:mb-16 opacity-100 translate-y-0 h-auto" 
              : "mb-0 opacity-0 -translate-y-8 pointer-events-none h-0"
          )}
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Neovim Config Generator
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Create a personalized Neovim configuration that works perfectly for your development workflow.
            No complex setup required - just select your preferences and get a ready-to-use init.lua file.
          </p>
        </div>

        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={STEPS.length}
          steps={STEPS}
          onStepClick={handleStepClick}
        />

        <div className="min-h-[400px] md:min-h-[600px] flex flex-col justify-between">
          <div 
            key={currentStep}
            className={cn(
              "flex-1 mb-8 md:mb-12 transition-all duration-300 ease-out",
              isTransitioning 
                ? "opacity-0 translate-y-4" 
                : "opacity-100 translate-y-0 animate-fade-in"
            )}
          >
            {renderCurrentStep()}
          </div>

        </div>
      </div>

      {/* Floating navigation for all screen sizes */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-50 shadow-lg animate-slide-in-bottom">
        <div className="flex justify-between items-center max-w-2xl mx-auto gap-3">
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            variant="outline"
            size="lg"
            className="flex-1 md:px-8 transition-all duration-200 hover-scale"
          >
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-background font-semibold flex-1 md:px-8 transition-all duration-200 hover-scale"
            >
              {currentStep === STEPS.length - 2 ? 'Generate Config' : currentStep === 0 ? 'Next' : 'Next (or Skip)'}
            </Button>
          ) : (
            <Button
              onClick={() => {
                setCurrentStep(0);
                const resetConfig = { 
                  languages: [], 
                  theme: '', 
                  plugins: [], 
                  settings: [], 
                  settingsConfig: getDefaultSettingsConfig(), 
                  leaderKey: ' ', 
                  keymaps: {},
                  downloadDir: ''
                };
                setConfig(resetConfig);
                setGeneratedConfig('');
                updateURL(0, resetConfig);
              }}
              variant="outline"
              size="lg"
              className="flex-1 md:px-8 transition-all duration-200 hover-scale"
            >
              Start Over
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;