import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { NvimConfig } from './PresetStacks';

interface ConfigImporterProps {
  onImportConfig: (config: NvimConfig) => void;
}

export const ConfigImporter: React.FC<ConfigImporterProps> = ({ onImportConfig }) => {
  const [configText, setConfigText] = useState('');
  const [parsedConfig, setParsedConfig] = useState<NvimConfig | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const parseInitLua = (content: string): NvimConfig => {
    const config: NvimConfig = {
      languages: [],
      theme: '',
      plugins: [],
      settings: [],
      leaderKey: ' ',
      keymaps: {}
    };

    // Parse leader key
    const leaderMatch = content.match(/vim\.g\.mapleader\s*=\s*['"]([^'"]*)['"]/);
    if (leaderMatch) {
      config.leaderKey = leaderMatch[1] || ' ';
    }

    // Parse languages from LSP configs
    const languagePatterns = {
      typescript: /tsserver|typescript/i,
      javascript: /tsserver|javascript/i,
      python: /pylsp|pyright|python/i,
      rust: /rust_analyzer|rust/i,
      go: /gopls|golang/i,
      c: /clangd|ccls|c[\s_]/i,
      cpp: /clangd|ccls|cpp|c\+\+/i,
      csharp: /csharp_ls|omnisharp|c#/i,
      java: /jdtls|java/i,
      lua: /lua_ls|sumneko|lua/i
    };

    Object.entries(languagePatterns).forEach(([lang, pattern]) => {
      if (pattern.test(content)) {
        config.languages.push(lang);
      }
    });

    // Parse theme
    const themePatterns = {
      catppuccin: /catppuccin/i,
      gruvbox: /gruvbox/i,
      tokyonight: /tokyonight/i,
      nord: /nord/i,
      onedark: /onedark/i
    };

    Object.entries(themePatterns).forEach(([theme, pattern]) => {
      if (pattern.test(content)) {
        config.theme = theme;
        return;
      }
    });

    // Parse plugins
    const pluginPatterns = {
      treesitter: /nvim-treesitter/i,
      telescope: /telescope\.nvim/i,
      'nvim-tree': /nvim-tree\.lua/i,
      tabbufline: /tabbufline|nvchad/i,
      dashboard: /dashboard-nvim|alpha-nvim/i,
      'indent-blankline': /indent-blankline/i,
      lualine: /lualine\.nvim/i,
      'nvim-surround': /nvim-surround/i,
      gitsigns: /gitsigns\.nvim/i,
      'which-key': /which-key\.nvim/i,
      'nvim-dap': /nvim-dap/i,
      'nvim-notify': /nvim-notify/i
    };

    Object.entries(pluginPatterns).forEach(([plugin, pattern]) => {
      if (pattern.test(content)) {
        config.plugins.push(plugin);
      }
    });

    // Parse settings
    if (/vim\.opt\.number\s*=\s*true|vim\.wo\.number\s*=\s*true/i.test(content)) {
      config.settings.push('line_numbers');
    }
    if (/vim\.opt\.wrap\s*=\s*true|vim\.wo\.wrap\s*=\s*true/i.test(content)) {
      config.settings.push('wrap_text');
    }
    if (/autocmd|BufWrite.*write/i.test(content)) {
      config.settings.push('auto_save');
    }

    // Parse keymaps
    const keymapPatterns = [
      { action: 'save_file', pattern: /vim\.keymap\.set.*['"]([^'"]*)['"]\s*,\s*['"]<[Cc]md-[Ss]>['"]|vim\.keymap\.set.*['"]([^'"]*)['"]\s*,\s*['"]:w/ },
      { action: 'quit', pattern: /vim\.keymap\.set.*['"]([^'"]*)['"]\s*,\s*['"]:q/ },
      { action: 'terminal_toggle', pattern: /vim\.keymap\.set.*['"]([^'"]*)['"]\s*,\s*.*terminal/i },
      { action: 'buffer_close', pattern: /vim\.keymap\.set.*['"]([^'"]*)['"]\s*,\s*.*bdelete/i },
      { action: 'split_vertical', pattern: /vim\.keymap\.set.*['"]([^'"]*)['"]\s*,\s*['"]:vs/ },
      { action: 'split_horizontal', pattern: /vim\.keymap\.set.*['"]([^'"]*)['"]\s*,\s*['"]:sp/ }
    ];

    keymapPatterns.forEach(({ action, pattern }) => {
      const match = content.match(pattern);
      if (match) {
        config.keymaps[action] = match[1] || match[2] || '';
      }
    });

    return config;
  };

  const handleAnalyze = () => {
    if (!configText.trim()) return;

    setIsAnalyzing(true);
    setParseError(null);

    try {
      const parsed = parseInitLua(configText);
      setParsedConfig(parsed);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse configuration');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImport = () => {
    if (parsedConfig) {
      onImportConfig(parsedConfig);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setConfigText(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">Import Existing Configuration</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload or paste your existing <code className="bg-background/50 px-2 py-1 rounded">init.lua</code> file to automatically detect your current setup and continue customizing from there.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Configuration Input
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload a file or paste your existing init.lua configuration below.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload init.lua
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".lua"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Or paste your configuration:</label>
            <Textarea
              placeholder="Paste your init.lua content here..."
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              className="min-h-48 font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAnalyze}
              disabled={!configText.trim() || isAnalyzing}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Configuration'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setConfigText('');
                setParsedConfig(null);
                setParseError(null);
              }}
            >
              Clear
            </Button>
          </div>

          {parseError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Parse Error:</strong> {parseError}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {parsedConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Detected Configuration
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Here's what we found in your configuration. You can import this to continue customizing.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Languages ({parsedConfig.languages.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {parsedConfig.languages.length > 0 ? (
                    parsedConfig.languages.map(lang => (
                      <span key={lang} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {lang}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None detected</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Theme</h4>
                <span className="text-sm">
                  {parsedConfig.theme || 'Default'}
                </span>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Plugins ({parsedConfig.plugins.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {parsedConfig.plugins.length > 0 ? (
                    parsedConfig.plugins.map(plugin => (
                      <span key={plugin} className="text-xs bg-secondary/50 text-secondary-foreground px-2 py-1 rounded">
                        {plugin}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None detected</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Settings</h4>
                <div className="flex flex-wrap gap-1">
                  {parsedConfig.settings.length > 0 ? (
                    parsedConfig.settings.map(setting => (
                      <span key={setting} className="text-xs bg-accent/50 text-accent-foreground px-2 py-1 rounded">
                        {setting.replace('_', ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None detected</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Leader Key</h4>
                <code className="text-sm bg-background/50 px-2 py-1 rounded">
                  {parsedConfig.leaderKey === ' ' ? 'Space' : parsedConfig.leaderKey}
                </code>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Keymaps ({Object.keys(parsedConfig.keymaps).length})</h4>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(parsedConfig.keymaps).length > 0 ? (
                    Object.keys(parsedConfig.keymaps).map(action => (
                      <span key={action} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        {action.replace('_', ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None detected</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleImport}
                className="w-full"
                size="lg"
              >
                Import This Configuration
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                This will replace your current selections and take you to the customization wizard.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};