export interface SettingsConfig {
  // Editor settings
  indentSize: number;
  lineWrapping: boolean;
  lineNumbers: 'none' | 'absolute' | 'relative' | 'both';
  showWhitespace: boolean;
  cursorLine: boolean;
  colorColumn: number | null;
  scrollOffset: number;
  
  // Behavior settings
  autoSave: boolean;
  autoSaveDelay: number;
  undoLevels: number;
  smartCase: boolean;
  ignoreCase: boolean;
  splitDirection: 'right' | 'below';
  
  // UI settings
  showSignColumn: boolean;
  showFoldColumn: boolean;
  terminalPosition: 'horizontal' | 'vertical' | 'floating';
  completion: 'basic' | 'advanced';
  
  // Performance settings
  updateTime: number;
  timeoutLength: number;
  lazyRedraw: boolean;
  
  // Plugin-specific settings
  telescope: {
    previewEnabled: boolean;
    historyLimit: number;
    ignoredPatterns: string[];
  };
  
  nvimTree: {
    width: number;
    autoClose: boolean;
    followCurrentFile: boolean;
    gitIntegration: boolean;
  };
  
  lualine: {
    theme: 'auto' | 'gruvbox' | 'nord' | 'catppuccin' | 'tokyonight';
    showFileEncoding: boolean;
    showFileType: boolean;
    showBranch: boolean;
  };
  
  treesitter: {
    autoInstall: boolean;
    highlightEnabled: boolean;
    indentEnabled: boolean;
    foldingEnabled: boolean;
  };
  
  debugging: {
    autoOpenUI: boolean;
    showInlineVariables: boolean;
    breakOnException: boolean;
  };
  
  git: {
    showLineBlame: boolean;
    showDiffInSigns: boolean;
    wordDiff: boolean;
  };
}

export interface SettingCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  settings: SettingDefinition[];
}

export interface SettingDefinition {
  id: keyof SettingsConfig | string; // Allow nested paths like "telescope.previewEnabled"
  title: string;
  description: string;
  type: 'boolean' | 'number' | 'select' | 'multiselect' | 'text';
  defaultValue: any;
  options?: Array<{ value: any; label: string; description?: string }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  unit?: string;
  validation?: (value: any) => boolean | string;
  dependsOn?: string; // Show only if another setting is enabled
  requiresPlugins?: string[]; // Show only if specific plugins are selected
}