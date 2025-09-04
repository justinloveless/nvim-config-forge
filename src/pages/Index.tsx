import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { WizardStep } from '@/components/WizardStep';
import ModernKeymaps from '@/components/ModernKeymaps';
import { ModernSettings } from '@/components/ModernSettings';
import { generateInitLua, downloadFile } from '@/utils/configGenerator';
import { getDefaultSettingsConfig } from '@/utils/settingsConfigGenerator';
import { SettingsConfig } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';
import { PresetStacks } from '@/components/PresetStacks';
import { InstallerScripts } from '@/components/InstallerScripts';
import { HealthCheckAnalyzer } from '@/components/HealthCheckAnalyzer';
import { ConfigImporter } from '@/components/ConfigImporter';
import { Code, Palette, Plug, Settings, Download, FileText, Copy, Check, Zap, Wrench, FileUp } from 'lucide-react';
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
    downloadDir: ''
  });
  const [generatedConfig, setGeneratedConfig] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState<{ [key: string]: boolean }>({});
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
    
    let keymaps = {};
    try {
      const keymapsParam = params.get('keymaps');
      if (keymapsParam) {
        keymaps = JSON.parse(keymapsParam);
      }
    } catch (e) {
      console.warn('Failed to parse keymaps from URL:', e);
    }

    const newConfig = { 
      languages, 
      theme, 
      plugins, 
      settings, 
      settingsConfig: getDefaultSettingsConfig(), 
      leaderKey, 
      keymaps,
      downloadDir
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

  const handleDownload = () => {
    downloadFile(generatedConfig, 'init.lua');
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
          />
        );
      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Your Configuration is Ready!
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Here's your generated init.lua file with automatic LSP servers and linters for {config.languages.join(', ')}. 
                Click download to save it to your computer.
              </p>
            </div>
            
            {/* Download Directory Setting */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-nvim-green flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Neovim Config Directory (optional)
                  </label>
                  <input
                    type="text"
                    value={config.downloadDir || ''}
                    onChange={(e) => {
                      const newConfig = { ...config, downloadDir: e.target.value };
                      setConfig(newConfig);
                      updateURL(currentStep, newConfig);
                    }}
                    placeholder="e.g., ~/.config/nvim/ or %LOCALAPPDATA%\nvim\"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Set this to your nvim config directory to enable the <code className="bg-background/50 px-1 rounded">open_config_web</code> keymap (<code className="bg-background/50 px-1 rounded">&lt;C-,&gt;</code> by default) in your generated config.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-card border-border">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-nvim-green" />
                    <span className="font-mono text-sm text-nvim-green">init.lua</span>
                  </div>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 border-nvim-green/30 hover:bg-nvim-green/10 hover:border-nvim-green/50"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1 text-nvim-green" />
                        <span className="text-nvim-green">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <pre className="text-sm text-foreground overflow-x-auto max-h-96 whitespace-pre-wrap font-mono bg-background/50 p-4 rounded-md border">
                  {generatedConfig}
                </pre>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button 
                onClick={handleDownload}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-background font-semibold px-8 py-3 mr-4"
              >
                <Download className="w-5 h-5 mr-2" />
                Download init.lua
              </Button>
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: "Link copied!",
                    description: "Share this link to let others use your exact configuration.",
                  });
                }}
                variant="outline"
                size="lg" 
                className="border-nvim-green/30 hover:bg-nvim-green/10 hover:border-nvim-green/50"
              >
                <Copy className="w-5 h-5 mr-2" />
                Share Configuration
              </Button>
            </div>

            <div className="mt-8 p-6 bg-card/50 rounded-lg border border-border">
              <h3 className="font-semibold text-nvim-green mb-3">Installation Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Download the init.lua file above</li>
                <li>Place it in your Neovim config directory:
                  <ul className="list-disc list-inside mt-1 ml-4 space-y-1">
                    <li><code className="bg-background/50 px-2 py-1 rounded">~/.config/nvim/</code> on Linux/macOS</li>
                    <li><code className="bg-background/50 px-2 py-1 rounded">%LOCALAPPDATA%\nvim\</code> on Windows</li>
                  </ul>
                </li>
                <li>Start Neovim - plugins will be automatically installed on first launch</li>
                <li>Enjoy your configured Neovim setup!</li>
              </ol>
              
              {config.languages.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-nvim-green mb-3">Required Tools for Language Support:</h4>
                  
                  <Tabs defaultValue="macos" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="macos">macOS</TabsTrigger>
                      <TabsTrigger value="linux">Linux</TabsTrigger>
                      <TabsTrigger value="windows">Windows</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="macos" className="space-y-4">
                      {config.languages.includes('typescript') || config.languages.includes('javascript') ? (
                        <div>
                          <p className="font-medium text-foreground mb-2">TypeScript/JavaScript:</p>
                          <CodeBlock command="npm install -g prettier" id="ts-macos" />
                        </div>
                      ) : null}
                      
                      {config.languages.includes('python') && (
                        <div>
                          <p className="font-medium text-foreground mb-2">Python:</p>
                          <CodeBlock command="pip install black" id="python-macos" />
                        </div>
                      )}
                      
                      {config.languages.includes('go') && (
                        <div>
                          <p className="font-medium text-foreground mb-2">Go:</p>
                          <CodeBlock command="go install mvdan.cc/gofumpt@latest" id="go-macos" />
                        </div>
                      )}
                      
                      {(config.languages.includes('c') || config.languages.includes('cpp')) && (
                        <div>
                          <p className="font-medium text-foreground mb-2">C/C++:</p>
                          <CodeBlock command="brew install clang-format" id="c-macos" />
                        </div>
                      )}
                      
                      {config.languages.includes('rust') && (
                        <div>
                          <p className="font-medium text-foreground mb-2">Rust:</p>
                          <CodeBlock command="rustup component add rustfmt" id="rust-macos" />
                        </div>
                      )}
                      
                      {config.languages.includes('lua') && (
                        <div>
                          <p className="font-medium text-foreground mb-2">Lua:</p>
                          <CodeBlock command="cargo install stylua" id="lua-macos" />
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="linux" className="space-y-4">
                      {config.languages.includes('typescript') || config.languages.includes('javascript') ? (
                        <div>
                          <p className="font-medium text-foreground mb-2">TypeScript/JavaScript:</p>
                          <CodeBlock command="npm install -g prettier" id="ts-linux" />
                        </div>
                      ) : null}
                      
                      {config.languages.includes('python') && (
                        <div>
                          <p className="font-medium text-foreground mb-2">Python:</p>
                          <CodeBlock command="pip install black" id="python-linux" />
                        </div>
                      )}
                      
                      {config.languages.includes('go') && (
                        <div>
                          <p className="font-medium text-foreground mb-2">Go:</p>
                          <CodeBlock command="go install mvdan.cc/gofumpt@latest" id="go-linux" />
                        </div>
                      )}
                      
                      {(config.languages.includes('c') || config.languages.includes('cpp')) && (
                        <div>
                          <p className="font-medium text-foreground mb-2">C/C++:</p>
                          <CodeBlock command="sudo apt install clang-format" id="c-linux" />
                        </div>
                      )}
                      
                      {config.languages.includes('rust') && (
                        <div>
                          <p className="font-medium text-foreground mb-2">Rust:</p>
                          <CodeBlock command="rustup component add rustfmt" id="rust-linux" />
                        </div>
                      )}
                      
                      {config.languages.includes('lua') && (
                        <div>
                          <p className="font-medium text-foreground mb-2">Lua:</p>
                          <CodeBlock command="cargo install stylua" id="lua-linux" />
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="windows" className="space-y-4">
                      {config.languages.includes('typescript') || config.languages.includes('javascript') ? (
                        <div>
                          <p className="font-medium text-foreground mb-2">TypeScript/JavaScript:</p>
                          <CodeBlock command="npm install -g prettier" id="ts-windows" />
                        </div>
                      ) : null}
                      
                      {config.languages.includes('python') && (
                        <div>
                          <p className="font-medium text-foreground mb-2">Python:</p>
                          <CodeBlock command="pip install black" id="python-windows" />
                        </div>
                      )}
                      
                      {config.languages.includes('go') && (
                        <div>
                          <p className="font-medium text-foreground mb-2">Go:</p>
                          <CodeBlock command="go install mvdan.cc/gofumpt@latest" id="go-windows" />
                        </div>
                      )}
                      
                      {(config.languages.includes('c') || config.languages.includes('cpp')) && (
                        <div>
                          <p className="font-medium text-foreground mb-2">C/C++:</p>
                          <CodeBlock command="choco install llvm" id="c-windows" />
                        </div>
                      )}
                      
                      {config.languages.includes('rust') && (
                        <div>
                          <p className="font-medium text-foreground mb-2">Rust:</p>
                          <CodeBlock command="rustup component add rustfmt" id="rust-windows" />
                        </div>
                      )}
                      
                      {config.languages.includes('lua') && (
                        <div>
                          <p className="font-medium text-foreground mb-2">Lua:</p>
                          <CodeBlock command="cargo install stylua" id="lua-windows" />
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-4 p-3 bg-nvim-green/10 border border-nvim-green/20 rounded">
                    <p className="text-sm text-nvim-green">
                      <strong>💡 Tip:</strong> Install these tools to enable automatic code formatting. 
                      Without them, you may see error messages when Neovim tries to format your code.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card pb-24">
      <div className={cn(
        "container mx-auto px-4 max-w-6xl mb-20",
        currentStep === 0 ? "py-6 md:py-12" : "pt-1 pb-6 md:pt-2 md:pb-12"
      )}>
        {/* Header - Only show on Quick Start step with animation */}
        <div 
          className={cn(
            "text-center transition-all duration-500 ease-out",
            currentStep === 0 
              ? "mb-8 md:mb-16 opacity-100 translate-y-0" 
              : "mb-0 opacity-0 -translate-y-8 pointer-events-none"
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

        {/* Advanced Features Toggle - Only show on Generate page */}
        {currentStep === STEPS.length - 1 && (
          <div className="mt-8 md:mt-16 pt-8 border-t border-border animate-fade-in">
            <div className="text-center">
              <Button
                onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground transition-all duration-200 hover-scale"
              >
                <Wrench className="w-4 h-4 mr-2" />
                {showAdvancedFeatures ? 'Hide' : 'Show'} Advanced Features
              </Button>
            </div>
            
            {showAdvancedFeatures && (
              <Tabs defaultValue="installer" className="mt-8 animate-scale-in">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="installer" className="transition-all duration-200 hover-scale">
                    <Zap className="w-4 h-4 mr-2" />
                    Quick Install
                  </TabsTrigger>
                  <TabsTrigger value="health" className="transition-all duration-200 hover-scale">
                    <Settings className="w-4 h-4 mr-2" />
                    Health Check
                  </TabsTrigger>
                  <TabsTrigger value="import" className="transition-all duration-200 hover-scale">
                    <FileUp className="w-4 h-4 mr-2" />
                    Import Config
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="installer" className="mt-6 animate-fade-in">
                  <InstallerScripts config={config} generatedConfig={generatedConfig} />
                </TabsContent>
                
                <TabsContent value="health" className="mt-6 animate-fade-in">
                  <HealthCheckAnalyzer />
                </TabsContent>
                
                <TabsContent value="import" className="mt-6 animate-fade-in">
                  <ConfigImporter onImportConfig={handleImportConfig} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
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