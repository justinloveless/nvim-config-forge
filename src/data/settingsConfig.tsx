import React from 'react';
import { Settings, Monitor, Code, Zap, GitBranch, Bug, Search, FolderOpen, Activity } from 'lucide-react';
import { SettingCategory } from '@/types/settings';

export const SETTINGS_CATEGORIES: SettingCategory[] = [
  {
    id: 'editor',
    title: 'Editor',
    description: 'Core editing experience and appearance',
    icon: <Code className="w-5 h-5" />,
    settings: [
      {
        id: 'indentSize',
        title: 'Indent Size',
        description: 'Number of spaces for indentation',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 8,
        step: 1,
        unit: 'spaces'
      },
      {
        id: 'lineNumbers',
        title: 'Line Numbers',
        description: 'How to display line numbers',
        type: 'select',
        defaultValue: 'both',
        options: [
          { value: 'none', label: 'Hidden', description: 'No line numbers' },
          { value: 'absolute', label: 'Absolute', description: 'Show absolute line numbers' },
          { value: 'relative', label: 'Relative', description: 'Show relative line numbers' },
          { value: 'both', label: 'Both', description: 'Show both absolute and relative' }
        ]
      },
      {
        id: 'lineWrapping',
        title: 'Line Wrapping',
        description: 'Wrap long lines for better readability',
        type: 'boolean',
        defaultValue: false
      },
      {
        id: 'showWhitespace',
        title: 'Show Whitespace',
        description: 'Display whitespace characters',
        type: 'boolean',
        defaultValue: false
      },
      {
        id: 'cursorLine',
        title: 'Highlight Cursor Line',
        description: 'Highlight the line where cursor is located',
        type: 'boolean',
        defaultValue: true
      },
      {
        id: 'colorColumn',
        title: 'Color Column',
        description: 'Show vertical line at specified column (0 to disable)',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 200,
        step: 1,
        unit: 'characters'
      },
      {
        id: 'scrollOffset',
        title: 'Scroll Offset',
        description: 'Keep cursor this many lines from screen edges',
        type: 'number',
        defaultValue: 8,
        min: 0,
        max: 20,
        step: 1,
        unit: 'lines'
      }
    ]
  },
  {
    id: 'behavior',
    title: 'Behavior',
    description: 'Editor behavior and workflow preferences',
    icon: <Activity className="w-5 h-5" />,
    settings: [
      {
        id: 'autoSave',
        title: 'Auto Save',
        description: 'Automatically save files when modified',
        type: 'boolean',
        defaultValue: false
      },
      {
        id: 'autoSaveDelay',
        title: 'Auto Save Delay',
        description: 'Delay before auto-saving changes',
        type: 'number',
        defaultValue: 1000,
        min: 100,
        max: 5000,
        step: 100,
        unit: 'ms',
        dependsOn: 'autoSave'
      },
      {
        id: 'undoLevels',
        title: 'Undo Levels',
        description: 'Maximum number of undo operations',
        type: 'number',
        defaultValue: 1000,
        min: 50,
        max: 10000,
        step: 50
      },
      {
        id: 'smartCase',
        title: 'Smart Case Search',
        description: 'Case-insensitive unless uppercase letters are used',
        type: 'boolean',
        defaultValue: true
      },
      {
        id: 'ignoreCase',
        title: 'Ignore Case',
        description: 'Ignore case in search patterns',
        type: 'boolean',
        defaultValue: true
      },
      {
        id: 'splitDirection',
        title: 'Split Direction',
        description: 'Default direction for new splits',
        type: 'select',
        defaultValue: 'below',
        options: [
          { value: 'right', label: 'Right', description: 'Open vertical splits to the right' },
          { value: 'below', label: 'Below', description: 'Open horizontal splits below' }
        ]
      }
    ]
  },
  {
    id: 'ui',
    title: 'Interface',
    description: 'User interface and visual elements',
    icon: <Monitor className="w-5 h-5" />,
    settings: [
      {
        id: 'showSignColumn',
        title: 'Show Sign Column',
        description: 'Always show column for git signs, diagnostics, etc.',
        type: 'boolean',
        defaultValue: true
      },
      {
        id: 'showFoldColumn',
        title: 'Show Fold Column',
        description: 'Display column for code folding indicators',
        type: 'boolean',
        defaultValue: false
      },
      {
        id: 'terminalPosition',
        title: 'Terminal Position',
        description: 'How to open integrated terminal',
        type: 'select',
        defaultValue: 'horizontal',
        options: [
          { value: 'horizontal', label: 'Bottom', description: 'Horizontal split at bottom' },
          { value: 'vertical', label: 'Right', description: 'Vertical split on right' },
          { value: 'floating', label: 'Floating', description: 'Floating terminal window' }
        ]
      },
      {
        id: 'completion',
        title: 'Completion Style',
        description: 'Autocompletion behavior and appearance',
        type: 'select',
        defaultValue: 'advanced',
        options: [
          { value: 'basic', label: 'Basic', description: 'Simple completion menu' },
          { value: 'advanced', label: 'Advanced', description: 'Rich completion with previews' }
        ]
      }
    ]
  },
  {
    id: 'performance',
    title: 'Performance',
    description: 'Optimize editor performance and responsiveness',
    icon: <Zap className="w-5 h-5" />,
    settings: [
      {
        id: 'updateTime',
        title: 'Update Time',
        description: 'Time to wait before triggering CursorHold event',
        type: 'number',
        defaultValue: 250,
        min: 50,
        max: 2000,
        step: 50,
        unit: 'ms'
      },
      {
        id: 'timeoutLength',
        title: 'Timeout Length',
        description: 'Time to wait for key sequence completion',
        type: 'number',
        defaultValue: 300,
        min: 100,
        max: 1000,
        step: 50,
        unit: 'ms'
      },
      {
        id: 'lazyRedraw',
        title: 'Lazy Redraw',
        description: 'Don\'t redraw during macro execution for better performance',
        type: 'boolean',
        defaultValue: false
      }
    ]
  },
  {
    id: 'telescope',
    title: 'Telescope',
    description: 'Fuzzy finder settings',
    icon: <Search className="w-5 h-5" />,
    settings: [
      {
        id: 'telescope.previewEnabled',
        title: 'Enable Preview',
        description: 'Show file preview in telescope results',
        type: 'boolean',
        defaultValue: true,
        requiresPlugins: ['telescope']
      },
      {
        id: 'telescope.historyLimit',
        title: 'History Limit',
        description: 'Number of recent searches to remember',
        type: 'number',
        defaultValue: 100,
        min: 10,
        max: 1000,
        step: 10,
        requiresPlugins: ['telescope']
      },
      {
        id: 'telescope.ignoredPatterns',
        title: 'Ignored Patterns',
        description: 'File patterns to ignore in search (comma-separated)',
        type: 'text',
        defaultValue: '*.git*,node_modules/*,*.lock',
        placeholder: '*.git*,node_modules/*,*.lock',
        requiresPlugins: ['telescope']
      }
    ]
  },
  {
    id: 'nvimtree',
    title: 'File Explorer',
    description: 'NvimTree file explorer settings',
    icon: <FolderOpen className="w-5 h-5" />,
    settings: [
      {
        id: 'nvimTree.width',
        title: 'Explorer Width',
        description: 'Width of the file explorer sidebar',
        type: 'number',
        defaultValue: 30,
        min: 20,
        max: 80,
        step: 5,
        unit: 'columns',
        requiresPlugins: ['nvim-tree']
      },
      {
        id: 'nvimTree.autoClose',
        title: 'Auto Close',
        description: 'Close tree when opening a file',
        type: 'boolean',
        defaultValue: false,
        requiresPlugins: ['nvim-tree']
      },
      {
        id: 'nvimTree.followCurrentFile',
        title: 'Follow Current File',
        description: 'Automatically focus the current file in tree',
        type: 'boolean',
        defaultValue: true,
        requiresPlugins: ['nvim-tree']
      },
      {
        id: 'nvimTree.gitIntegration',
        title: 'Git Integration',
        description: 'Show git status in file explorer',
        type: 'boolean',
        defaultValue: true,
        requiresPlugins: ['nvim-tree']
      }
    ]
  },
  {
    id: 'statusline',
    title: 'Status Line',
    description: 'Lualine statusline configuration',
    icon: <Activity className="w-5 h-5" />,
    settings: [
      {
        id: 'lualine.theme',
        title: 'Statusline Theme',
        description: 'Visual theme for the status line',
        type: 'select',
        defaultValue: 'auto',
        options: [
          { value: 'auto', label: 'Auto', description: 'Match editor theme' },
          { value: 'gruvbox', label: 'Gruvbox', description: 'Gruvbox theme colors' },
          { value: 'nord', label: 'Nord', description: 'Nord theme colors' },
          { value: 'catppuccin', label: 'Catppuccin', description: 'Catppuccin theme colors' },
          { value: 'tokyonight', label: 'TokyoNight', description: 'TokyoNight theme colors' }
        ],
        requiresPlugins: ['lualine']
      },
      {
        id: 'lualine.showFileEncoding',
        title: 'Show File Encoding',
        description: 'Display file encoding in status line',
        type: 'boolean',
        defaultValue: false,
        requiresPlugins: ['lualine']
      },
      {
        id: 'lualine.showFileType',
        title: 'Show File Type',
        description: 'Display file type in status line',
        type: 'boolean',
        defaultValue: true,
        requiresPlugins: ['lualine']
      },
      {
        id: 'lualine.showBranch',
        title: 'Show Git Branch',
        description: 'Display current git branch in status line',
        type: 'boolean',
        defaultValue: true,
        requiresPlugins: ['lualine']
      }
    ]
  },
  {
    id: 'treesitter',
    title: 'Syntax Highlighting',
    description: 'TreeSitter syntax parsing settings',
    icon: <Code className="w-5 h-5" />,
    settings: [
      {
        id: 'treesitter.autoInstall',
        title: 'Auto Install Parsers',
        description: 'Automatically install language parsers',
        type: 'boolean',
        defaultValue: true,
        requiresPlugins: ['treesitter']
      },
      {
        id: 'treesitter.highlightEnabled',
        title: 'Syntax Highlighting',
        description: 'Enable TreeSitter syntax highlighting',
        type: 'boolean',
        defaultValue: true,
        requiresPlugins: ['treesitter']
      },
      {
        id: 'treesitter.indentEnabled',
        title: 'Smart Indentation',
        description: 'Enable TreeSitter-based indentation',
        type: 'boolean',
        defaultValue: true,
        requiresPlugins: ['treesitter']
      },
      {
        id: 'treesitter.foldingEnabled',
        title: 'Code Folding',
        description: 'Enable TreeSitter-based code folding',
        type: 'boolean',
        defaultValue: false,
        requiresPlugins: ['treesitter']
      }
    ]
  },
  {
    id: 'debugging',
    title: 'Debugging',
    description: 'Debug adapter protocol settings',
    icon: <Bug className="w-5 h-5" />,
    settings: [
      {
        id: 'debugging.autoOpenUI',
        title: 'Auto Open Debug UI',
        description: 'Automatically open debug UI when debugging starts',
        type: 'boolean',
        defaultValue: true,
        requiresPlugins: ['nvim-dap']
      },
      {
        id: 'debugging.showInlineVariables',
        title: 'Inline Variables',
        description: 'Show variable values inline while debugging',
        type: 'boolean',
        defaultValue: true,
        requiresPlugins: ['nvim-dap']
      },
      {
        id: 'debugging.breakOnException',
        title: 'Break on Exception',
        description: 'Automatically break when exceptions occur',
        type: 'boolean',
        defaultValue: false,
        requiresPlugins: ['nvim-dap']
      }
    ]
  },
  {
    id: 'git',
    title: 'Git Integration',
    description: 'Git workflow and display settings',
    icon: <GitBranch className="w-5 h-5" />,
    settings: [
      {
        id: 'git.showLineBlame',
        title: 'Show Line Blame',
        description: 'Display git blame information for current line',
        type: 'boolean',
        defaultValue: false,
        requiresPlugins: ['gitsigns']
      },
      {
        id: 'git.showDiffInSigns',
        title: 'Show Diff in Signs',
        description: 'Display git changes in sign column',
        type: 'boolean',
        defaultValue: true,
        requiresPlugins: ['gitsigns']
      },
      {
        id: 'git.wordDiff',
        title: 'Word-level Diff',
        description: 'Show word-level differences in git hunks',
        type: 'boolean',
        defaultValue: false,
        requiresPlugins: ['gitsigns']
      }
    ]
  }
];