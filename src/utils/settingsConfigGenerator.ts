import { SettingsConfig } from '@/types/settings';

interface NvimConfig {
  languages: string[];
  theme: string;
  plugins: string[];
  settings: string[]; // Legacy settings array
  settingsConfig?: SettingsConfig; // New settings object
  leaderKey: string;
  keymaps: { [key: string]: string };
}

export const generateSettingsLua = (settings: SettingsConfig): string => {
  let lua = '';

  // Basic Vim options
  lua += `-- Editor Settings\n`;
  
  // Line numbers
  if (settings.lineNumbers !== 'none') {
    lua += `vim.opt.number = true\n`;
    if (settings.lineNumbers === 'relative' || settings.lineNumbers === 'both') {
      lua += `vim.opt.relativenumber = true\n`;
    }
  }

  // Indentation
  lua += `vim.opt.tabstop = ${settings.indentSize}\n`;
  lua += `vim.opt.shiftwidth = ${settings.indentSize}\n`;
  lua += `vim.opt.expandtab = true\n`;

  // Line wrapping
  if (settings.lineWrapping) {
    lua += `vim.opt.wrap = true\n`;
    lua += `vim.opt.linebreak = true\n`;
  } else {
    lua += `vim.opt.wrap = false\n`;
  }

  // Show whitespace
  if (settings.showWhitespace) {
    lua += `vim.opt.list = true\n`;
    lua += `vim.opt.listchars = { space = '·', tab = '→ ', eol = '↴' }\n`;
  }

  // Cursor line highlighting
  if (settings.cursorLine) {
    lua += `vim.opt.cursorline = true\n`;
  }

  // Color column
  if (settings.colorColumn && settings.colorColumn > 0) {
    lua += `vim.opt.colorcolumn = '${settings.colorColumn}'\n`;
  }

  // Scroll offset
  lua += `vim.opt.scrolloff = ${settings.scrollOffset}\n`;

  // Behavior settings
  lua += `\n-- Behavior Settings\n`;
  
  // Auto save
  if (settings.autoSave) {
    lua += `-- Auto save configuration\n`;
    lua += `vim.api.nvim_create_autocmd({'TextChanged', 'TextChangedI'}, {\n`;
    lua += `  pattern = '*',\n`;
    lua += `  callback = function()\n`;
    lua += `    vim.defer_fn(function()\n`;
    lua += `      if vim.bo.modified then\n`;
    lua += `        vim.cmd('silent! write')\n`;
    lua += `      end\n`;
    lua += `    end, ${settings.autoSaveDelay})\n`;
    lua += `  end,\n`;
    lua += `})\n`;
  }

  // Undo levels
  lua += `vim.opt.undolevels = ${settings.undoLevels}\n`;

  // Search settings
  if (settings.smartCase) {
    lua += `vim.opt.smartcase = true\n`;
  }
  if (settings.ignoreCase) {
    lua += `vim.opt.ignorecase = true\n`;
  }

  // Split direction
  if (settings.splitDirection === 'right') {
    lua += `vim.opt.splitright = true\n`;
  }
  if (settings.splitDirection === 'below') {
    lua += `vim.opt.splitbelow = true\n`;
  }

  // UI Settings
  lua += `\n-- UI Settings\n`;
  
  if (settings.showSignColumn) {
    lua += `vim.opt.signcolumn = 'yes'\n`;
  }

  if (settings.showFoldColumn) {
    lua += `vim.opt.foldcolumn = '1'\n`;
  }

  // Performance settings
  lua += `\n-- Performance Settings\n`;
  lua += `vim.opt.updatetime = ${settings.updateTime}\n`;
  lua += `vim.opt.timeoutlen = ${settings.timeoutLength}\n`;
  
  if (settings.lazyRedraw) {
    lua += `vim.opt.lazyredraw = true\n`;
  }

  return lua;
};

export const generatePluginSettingsLua = (
  settings: SettingsConfig,
  selectedPlugins: string[]
): string => {
  let lua = '';

  // Telescope settings
  if (selectedPlugins.includes('telescope')) {
    lua += `\n-- Telescope Configuration\n`;
    lua += `require('telescope').setup({\n`;
    lua += `  defaults = {\n`;
    lua += `    preview = ${settings.telescope.previewEnabled ? 'true' : 'false'},\n`;
    if (settings.telescope.ignoredPatterns.length > 0) {
      lua += `    file_ignore_patterns = { ${settings.telescope.ignoredPatterns.map(p => `"${p}"`).join(', ')} },\n`;
    }
    lua += `  },\n`;
    lua += `  pickers = {\n`;
    lua += `    find_files = {\n`;
    lua += `      history_limit = ${settings.telescope.historyLimit},\n`;
    lua += `    },\n`;
    lua += `  },\n`;
    lua += `})\n`;
  }

  // NvimTree settings
  if (selectedPlugins.includes('nvim-tree')) {
    lua += `\n-- NvimTree Configuration\n`;
    lua += `require("nvim-tree").setup({\n`;
    lua += `  view = {\n`;
    lua += `    width = ${settings.nvimTree.width},\n`;
    lua += `  },\n`;
    lua += `  actions = {\n`;
    lua += `    open_file = {\n`;
    lua += `      quit_on_open = ${settings.nvimTree.autoClose ? 'true' : 'false'},\n`;
    lua += `    },\n`;
    lua += `  },\n`;
    lua += `  update_focused_file = {\n`;
    lua += `    enable = ${settings.nvimTree.followCurrentFile ? 'true' : 'false'},\n`;
    lua += `  },\n`;
    lua += `  git = {\n`;
    lua += `    enable = ${settings.nvimTree.gitIntegration ? 'true' : 'false'},\n`;
    lua += `  },\n`;
    lua += `})\n`;
  }

  // Lualine settings
  if (selectedPlugins.includes('lualine')) {
    lua += `\n-- Lualine Configuration\n`;
    lua += `require('lualine').setup({\n`;
    lua += `  options = {\n`;
    lua += `    theme = '${settings.lualine.theme}',\n`;
    lua += `  },\n`;
    lua += `  sections = {\n`;
    lua += `    lualine_c = { 'filename'${settings.lualine.showFileType ? ", 'filetype'" : ''} },\n`;
    if (settings.lualine.showBranch) {
      lua += `    lualine_b = { 'branch', 'diff', 'diagnostics' },\n`;
    }
    if (settings.lualine.showFileEncoding) {
      lua += `    lualine_y = { 'encoding', 'fileformat', 'filetype' },\n`;
    }
    lua += `  },\n`;
    lua += `})\n`;
  }

  // TreeSitter settings
  if (selectedPlugins.includes('treesitter')) {
    lua += `\n-- TreeSitter Configuration\n`;
    lua += `require("nvim-treesitter.configs").setup({\n`;
    lua += `  auto_install = ${settings.treesitter.autoInstall ? 'true' : 'false'},\n`;
    lua += `  highlight = { enable = ${settings.treesitter.highlightEnabled ? 'true' : 'false'} },\n`;
    lua += `  indent = { enable = ${settings.treesitter.indentEnabled ? 'true' : 'false'} },\n`;
    if (settings.treesitter.foldingEnabled) {
      lua += `  fold = { enable = true },\n`;
      lua += `})\n`;
      lua += `vim.opt.foldmethod = 'expr'\n`;
      lua += `vim.opt.foldexpr = 'nvim_treesitter#foldexpr()'\n`;
    } else {
      lua += `})\n`;
    }
  }

  // DAP settings
  if (selectedPlugins.includes('nvim-dap')) {
    lua += `\n-- DAP Configuration\n`;
    lua += `local dap = require("dap")\n`;
    lua += `local dapui = require("dapui")\n`;
    
    if (settings.debugging.autoOpenUI) {
      lua += `dap.listeners.after.event_initialized["dapui_config"] = function()\n`;
      lua += `  dapui.open()\n`;
      lua += `end\n`;
    }
    
    if (settings.debugging.showInlineVariables) {
      lua += `-- Enable inline variable display\n`;
      lua += `vim.fn.sign_define('DapBreakpoint', { text='B', texthl='DapBreakpoint', linehl='', numhl='' })\n`;
    }

    if (settings.debugging.breakOnException) {
      lua += `-- Break on exceptions\n`;
      lua += `dap.defaults.fallback.exception_breakpoints = {'raised'}\n`;
    }
  }

  // GitSigns settings
  if (selectedPlugins.includes('gitsigns')) {
    lua += `\n-- GitSigns Configuration\n`;
    lua += `require('gitsigns').setup({\n`;
    if (settings.git.showLineBlame) {
      lua += `  current_line_blame = true,\n`;
      lua += `  current_line_blame_opts = {\n`;
      lua += `    virt_text = true,\n`;
      lua += `    virt_text_pos = 'eol',\n`;
      lua += `  },\n`;
    }
    lua += `  signs = {\n`;
    if (settings.git.showDiffInSigns) {
      lua += `    add = { text = '+' },\n`;
      lua += `    change = { text = '~' },\n`;
      lua += `    delete = { text = '_' },\n`;
      lua += `    topdelete = { text = '‾' },\n`;
      lua += `    changedelete = { text = '~' },\n`;
    } else {
      lua += `    add = { text = '' },\n`;
      lua += `    change = { text = '' },\n`;
      lua += `    delete = { text = '' },\n`;
      lua += `    topdelete = { text = '' },\n`;
      lua += `    changedelete = { text = '' },\n`;
    }
    lua += `  },\n`;
    if (settings.git.wordDiff) {
      lua += `  word_diff = true,\n`;
    }
    lua += `})\n`;
  }

  return lua;
};

// Default settings configuration
export const getDefaultSettingsConfig = (): SettingsConfig => ({
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
});