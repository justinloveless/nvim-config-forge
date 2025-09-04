import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Globe, Database, Gamepad2, Cpu, Palette, FileUp } from 'lucide-react';
import { ConfigImporter } from './ConfigImporter';

export interface NvimConfig {
  languages: string[];
  theme: string;
  plugins: string[];
  settings: string[];
  leaderKey: string;
  keymaps: { [key: string]: string };
}

interface PresetStacksProps {
  onApplyPreset: (config: NvimConfig) => void;
  onImportConfig?: (config: NvimConfig) => void;
}

const PRESET_STACKS = [
  {
    id: 'web-dev',
    title: 'Web Development',
    description: 'Perfect for JavaScript, TypeScript, and React development',
    icon: <Globe className="w-6 h-6" />,
    color: 'text-blue-500',
    config: {
      languages: ['typescript', 'javascript'],
      theme: 'tokyonight',
      plugins: ['treesitter', 'telescope', 'nvim-tree', 'lualine', 'gitsigns', 'which-key', 'nvim-surround'],
      settings: ['line_numbers', 'auto_save'],
      leaderKey: ' ',
      keymaps: {
        save_file: '<leader>w',
        terminal_toggle: '<leader>t',
        buffer_close: '<leader>bd',
        split_vertical: '<leader>v'
      }
    }
  },
  {
    id: 'system-programming',
    title: 'Systems Programming',
    description: 'Optimized for Rust, C, and C++ development',
    icon: <Cpu className="w-6 h-6" />,
    color: 'text-orange-500',
    config: {
      languages: ['rust', 'c', 'cpp'],
      theme: 'gruvbox',
      plugins: ['treesitter', 'telescope', 'nvim-tree', 'nvim-dap', 'lualine', 'gitsigns', 'which-key'],
      settings: ['line_numbers'],
      leaderKey: ' ',
      keymaps: {
        save_file: '<leader>w',
        terminal_toggle: '<leader>t',
        buffer_close: '<leader>bd'
      }
    }
  },
  {
    id: 'data-science',
    title: 'Data Science',
    description: 'Configured for Python data analysis and machine learning',
    icon: <Database className="w-6 h-6" />,
    color: 'text-green-500',
    config: {
      languages: ['python'],
      theme: 'catppuccin',
      plugins: ['treesitter', 'telescope', 'nvim-tree', 'lualine', 'indent-blankline', 'nvim-notify'],
      settings: ['line_numbers', 'wrap_text'],
      leaderKey: ' ',
      keymaps: {
        save_file: '<leader>w',
        terminal_toggle: '<leader>t',
        select_all: '<leader>a'
      }
    }
  },
  {
    id: 'minimal',
    title: 'Minimal Setup',
    description: 'Lightweight configuration with essential features only',
    icon: <Code className="w-6 h-6" />,
    color: 'text-gray-500',
    config: {
      languages: ['lua'],
      theme: 'default',
      plugins: ['treesitter', 'telescope'],
      settings: ['line_numbers'],
      leaderKey: ' ',
      keymaps: {
        save_file: '<leader>w',
        quit: '<leader>q'
      }
    }
  },
  {
    id: 'game-dev',
    title: 'Game Development',
    description: 'Tailored for C# and Unity game development',
    icon: <Gamepad2 className="w-6 h-6" />,
    color: 'text-purple-500',
    config: {
      languages: ['csharp'],
      theme: 'onedark',
      plugins: ['treesitter', 'telescope', 'nvim-tree', 'lualine', 'nvim-dap', 'which-key'],
      settings: ['line_numbers', 'auto_save'],
      leaderKey: ' ',
      keymaps: {
        save_file: '<leader>w',
        terminal_toggle: '<leader>t',
        buffer_close: '<leader>bd',
        split_vertical: '<leader>v'
      }
    }
  },
  {
    id: 'full-stack',
    title: 'Full Stack',
    description: 'Complete setup for full-stack development',
    icon: <Palette className="w-6 h-6" />,
    color: 'text-indigo-500',
    config: {
      languages: ['typescript', 'javascript', 'python', 'go'],
      theme: 'catppuccin',
      plugins: ['treesitter', 'telescope', 'nvim-tree', 'tabbufline', 'dashboard', 'lualine', 'gitsigns', 'which-key', 'nvim-surround'],
      settings: ['line_numbers', 'auto_save', 'wrap_text'],
      leaderKey: ' ',
      keymaps: {
        save_file: '<leader>w',
        terminal_toggle: '<leader>t',
        buffer_close: '<leader>bd',
        buffer_next: '<leader>bn',
        buffer_prev: '<leader>bp',
        split_vertical: '<leader>v',
        split_horizontal: '<leader>s'
      }
    }
  },
  {
    id: 'aspnet',
    title: 'ASP.NET Development',
    description: 'Optimized for ASP.NET web development with C# and TypeScript',
    icon: <Globe className="w-6 h-6" />,
    color: 'text-violet-500',
    config: {
      languages: ['typescript', 'javascript', 'csharp', 'lua'],
      theme: 'onedark',
      plugins: ['treesitter', 'telescope', 'nvim-tree', 'tabbufline', 'which-key', 'nvim-dap'],
      settings: ['line_numbers', 'auto_save'],
      leaderKey: ' ',
      keymaps: {
        save_file: '<leader>w',
        terminal_toggle: '<leader>t',
        buffer_close: '<leader>bd',
        buffer_next: '<leader>bn',
        buffer_prev: '<leader>bp',
        split_vertical: '<leader>v',
        split_horizontal: '<leader>s'
      }
    }
  }
];

export const PresetStacks: React.FC<PresetStacksProps> = ({ onApplyPreset, onImportConfig }) => {
  const [showImporter, setShowImporter] = useState(false);
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Quick Start with Preset Stacks
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose a pre-configured setup optimized for your development workflow. You can customize it further after applying.
        </p>
        {onImportConfig && (
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => setShowImporter(!showImporter)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileUp className="w-4 h-4" />
              {showImporter ? 'Hide' : 'Import Existing Config'}
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRESET_STACKS.map((preset) => (
          <Card key={preset.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={preset.color}>
                  {preset.icon}
                </div>
                <CardTitle className="text-lg">{preset.title}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">{preset.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-4">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Languages:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {preset.config.languages.map(lang => (
                      <span key={lang} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Theme: {preset.config.theme} • {preset.config.plugins.length} plugins
                  </span>
                </div>
              </div>
              <Button 
                onClick={() => onApplyPreset(preset.config)}
                className="w-full group-hover:bg-primary/90"
              >
                Apply This Preset
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {showImporter && onImportConfig && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="w-5 h-5" />
                Import Your Existing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConfigImporter onImportConfig={onImportConfig} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};