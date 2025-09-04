import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { WizardStep } from '@/components/WizardStep';
import KeymapsTable from '@/components/KeymapsTable';
import { generateInitLua, downloadFile } from '@/utils/configGenerator';
import { useToast } from '@/hooks/use-toast';
import { Code, Palette, Plug, Settings, Download, FileText, Copy, Check } from 'lucide-react';

interface NvimConfig {
  languages: string[];
  theme: string;
  plugins: string[];
  settings: string[];
  leaderKey: string;
  keymaps: { [key: string]: string };
}

const STEPS = [
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
    leaderKey: ' ',
    keymaps: {}
  });
  const [generatedConfig, setGeneratedConfig] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleLanguageChange = (selectedIds: string[]) => {
    setConfig(prev => ({ ...prev, languages: selectedIds }));
  };

  const handleThemeChange = (selectedIds: string[]) => {
    setConfig(prev => ({ ...prev, theme: selectedIds[0] || '' }));
  };

  const handlePluginChange = (selectedIds: string[]) => {
    setConfig(prev => ({ ...prev, plugins: selectedIds }));
  };

  const handleSettingsChange = (selectedIds: string[]) => {
    setConfig(prev => ({ ...prev, settings: selectedIds }));
  };

  const handleLeaderKeyChange = (leaderKey: string) => {
    setConfig(prev => ({ ...prev, leaderKey }));
  };

  const handleKeymapChange = (action: string, keymap: string) => {
    setConfig(prev => ({
      ...prev,
      keymaps: { ...prev.keymaps, [action]: keymap }
    }));
  };

  const handleNext = () => {
    if (currentStep === STEPS.length - 2) {
      // Generate config on the last step
      const generated = generateInitLua(config);
      setGeneratedConfig(generated);
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
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

  const canProceed = () => {
    switch (currentStep) {
      case 0: return config.languages.length > 0;
      case 1: return true; // Theme is optional (can skip)
      case 2: return true; // Plugins are optional
      case 3: return true; // Settings are optional
      case 4: return true; // Keymaps are optional
      default: return true;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
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
      case 1:
        return (
          <WizardStep
            title="Choose Your Theme"
            subtitle="Pick a color scheme that makes coding enjoyable for your eyes. You can skip this to use the default theme."
            options={THEME_OPTIONS}
            selectedOptions={config.theme ? [config.theme] : []}
            onSelectionChange={handleThemeChange}
            multiSelect={false}
          />
        );
      case 2:
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
      case 3:
        return (
          <WizardStep
            title="Editor Settings"
            subtitle="Configure common editor preferences. These can be changed later in your config."
            options={SETTINGS_OPTIONS}
            selectedOptions={config.settings}
            onSelectionChange={handleSettingsChange}
            multiSelect={true}
          />
        );
      case 4:
        return (
          <KeymapsTable
            leaderKey={config.leaderKey}
            keymaps={config.keymaps}
            onLeaderKeyChange={handleLeaderKeyChange}
            onKeymapChange={handleKeymapChange}
          />
        );
      case 5:
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
                className="bg-gradient-primary hover:opacity-90 text-background font-semibold px-8 py-3"
              >
                <Download className="w-5 h-5 mr-2" />
                Download init.lua
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
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Neovim Config Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create a personalized Neovim configuration that works perfectly for your development workflow.
            No complex setup required - just select your preferences and get a ready-to-use init.lua file.
          </p>
        </div>

        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={STEPS.length}
          steps={STEPS}
        />

        <div className="mb-12">
          {renderCurrentStep()}
        </div>

        <div className="flex justify-between">
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            variant="outline"
            size="lg"
          >
            Back
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-background font-semibold"
            >
              {currentStep === STEPS.length - 2 ? 'Generate Config' : currentStep === 0 ? 'Next' : 'Next (or Skip)'}
            </Button>
          ) : (
            <Button
              onClick={() => {
                setCurrentStep(0);
                setConfig({ languages: [], theme: '', plugins: [], settings: [], leaderKey: ' ', keymaps: {} });
                setGeneratedConfig('');
              }}
              variant="outline"
              size="lg"
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