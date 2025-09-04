interface NvimConfig {
  languages: string[];
  theme: string;
  plugins: string[];
  settings: string[];
}

export const generateInitLua = (config: NvimConfig): string => {
  const { languages, theme, plugins, settings } = config;

  let initContent = `-- Generated Neovim Configuration
-- Languages: ${languages.join(', ')}
-- Theme: ${theme}
-- Generated on: ${new Date().toLocaleDateString()}

-- Basic Options
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.mouse = 'a'
vim.opt.clipboard = 'unnamedplus'
vim.opt.breakindent = true
vim.opt.undofile = true
vim.opt.ignorecase = true
vim.opt.smartcase = true
vim.opt.signcolumn = 'yes'
vim.opt.updatetime = 250
vim.opt.timeoutlen = 300
vim.opt.splitright = true
vim.opt.splitbelow = true
vim.opt.scrolloff = 10
vim.opt.hlsearch = true

-- Tab settings
vim.opt.tabstop = 2
vim.opt.shiftwidth = 2
vim.opt.expandtab = true

-- Highlight on search, but clear on pressing <Esc> in normal mode
vim.keymap.set('n', '<Esc>', '<cmd>nohlsearch<CR>')
`;

  // Add settings-specific configurations
  if (settings.includes('line_numbers')) {
    initContent += `\n-- Line numbers enabled
vim.opt.number = true
vim.opt.relativenumber = true
`;
  }

  if (settings.includes('auto_save')) {
    initContent += `\n-- Auto save
vim.api.nvim_create_autocmd({'TextChanged', 'TextChangedI'}, {
  pattern = '*',
  command = 'silent! write',
})
`;
  }

  if (settings.includes('wrap_text')) {
    initContent += `\n-- Text wrapping
vim.opt.wrap = true
vim.opt.linebreak = true
`;
  }

  // Add plugin manager setup
  if (plugins.length > 0) {
    initContent += `\n-- Bootstrap lazy.nvim plugin manager
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable",
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- Plugin setup
require("lazy").setup({
`;

    // Add theme plugin
    if (theme && theme !== 'default') {
      const themePlugins = {
        'catppuccin': '{ "catppuccin/nvim", name = "catppuccin", priority = 1000 }',
        'gruvbox': '{ "ellisonleao/gruvbox.nvim", priority = 1000 }',
        'tokyonight': '{ "folke/tokyonight.nvim", lazy = false, priority = 1000 }',
        'nord': '{ "shaunsingh/nord.nvim", priority = 1000 }',
        'onedark': '{ "navarasu/onedark.nvim", priority = 1000 }',
      };
      
      if (themePlugins[theme as keyof typeof themePlugins]) {
        initContent += `  -- Theme
  ${themePlugins[theme as keyof typeof themePlugins]},
`;
      }
    }

    // Add plugins
    if (plugins.includes('treesitter')) {
      const langList = languages.map(lang => {
        const langMap: { [key: string]: string } = {
          'typescript': 'typescript',
          'javascript': 'javascript',
          'python': 'python',
          'rust': 'rust',
          'go': 'go',
          'c': 'c',
          'cpp': 'cpp',
          'csharp': 'c_sharp',
          'java': 'java',
          'lua': 'lua',
          'vim': 'vim',
          'bash': 'bash',
          'json': 'json',
          'yaml': 'yaml',
          'html': 'html',
          'css': 'css'
        };
        return langMap[lang] || lang;
      }).join('", "');

      initContent += `  -- Syntax highlighting
  {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    config = function()
      require("nvim-treesitter.configs").setup({
        ensure_installed = { "${langList}" },
        highlight = { enable = true },
        indent = { enable = true },
      })
    end,
  },
`;
    }

    if (plugins.includes('mason')) {
      initContent += `  -- LSP Manager
  {
    "williamboman/mason.nvim",
    config = function()
      require("mason").setup()
    end,
  },
  {
    "williamboman/mason-lspconfig.nvim",
    config = function()
      require("mason-lspconfig").setup({
        ensure_installed = {`;

      // Add language servers based on selected languages
      const lspServers = languages.map(lang => {
        const serverMap: { [key: string]: string } = {
          'typescript': 'tsserver',
          'javascript': 'tsserver',
          'python': 'pyright',
          'rust': 'rust_analyzer',
          'go': 'gopls',
          'c': 'clangd',
          'cpp': 'clangd',
          'csharp': 'omnisharp',
          'java': 'jdtls',
          'lua': 'lua_ls'
        };
        return serverMap[lang];
      }).filter(Boolean);

      initContent += `
          "${lspServers.join('", "')}"
        },
      })
    end,
  },
  {
    "neovim/nvim-lspconfig",
    config = function()
      local capabilities = require('cmp_nvim_lsp').default_capabilities()
      local lspconfig = require('lspconfig')
      
`;

      // Setup each LSP server
      lspServers.forEach(server => {
        initContent += `      lspconfig.${server}.setup({ capabilities = capabilities })
`;
      });

      initContent += `    end,
  },
`;
    }

    if (plugins.includes('telescope')) {
      initContent += `  -- Fuzzy finder
  {
    "nvim-telescope/telescope.nvim",
    tag = "0.1.5",
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      local builtin = require('telescope.builtin')
      vim.keymap.set('n', '<leader>ff', builtin.find_files, {})
      vim.keymap.set('n', '<leader>fg', builtin.live_grep, {})
      vim.keymap.set('n', '<leader>fb', builtin.buffers, {})
      vim.keymap.set('n', '<leader>fh', builtin.help_tags, {})
    end,
  },
`;
    }

    if (plugins.includes('nvim-tree')) {
      initContent += `  -- File explorer
  {
    "nvim-tree/nvim-tree.lua",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    config = function()
      require("nvim-tree").setup()
      vim.keymap.set('n', '<leader>e', '<cmd>NvimTreeToggle<CR>')
    end,
  },
`;
    }

    if (plugins.includes('completion')) {
      initContent += `  -- Autocompletion
  {
    "hrsh7th/nvim-cmp",
    dependencies = {
      "hrsh7th/cmp-nvim-lsp",
      "hrsh7th/cmp-buffer",
      "hrsh7th/cmp-path",
      "L3MON4D3/LuaSnip",
      "saadparwaiz1/cmp_luasnip",
    },
    config = function()
      local cmp = require('cmp')
      cmp.setup({
        snippet = {
          expand = function(args)
            require('luasnip').lsp_expand(args.body)
          end,
        },
        mapping = cmp.mapping.preset.insert({
          ['<C-b>'] = cmp.mapping.scroll_docs(-4),
          ['<C-f>'] = cmp.mapping.scroll_docs(4),
          ['<C-Space>'] = cmp.mapping.complete(),
          ['<C-e>'] = cmp.mapping.abort(),
          ['<CR>'] = cmp.mapping.confirm({ select = true }),
        }),
        sources = cmp.config.sources({
          { name = 'nvim_lsp' },
          { name = 'luasnip' },
        }, {
          { name = 'buffer' },
        })
      })
    end,
  },
`;
    }

    initContent += `})

`;
  }

  // Set colorscheme
  if (theme && theme !== 'default') {
    initContent += `-- Set colorcheme
vim.cmd.colorscheme('${theme}')
`;
  }

  // Add leader key mapping
  initContent += `\n-- Set leader key
vim.g.mapleader = ' '
vim.g.maplocalleader = ' '

-- Basic keymaps
vim.keymap.set('n', '<leader>w', '<cmd>write<CR>', { desc = 'Save file' })
vim.keymap.set('n', '<leader>q', '<cmd>quit<CR>', { desc = 'Quit' })
vim.keymap.set('n', '<leader>h', '<cmd>nohlsearch<CR>', { desc = 'Clear highlights' })

-- Window navigation
vim.keymap.set('n', '<C-h>', '<C-w><C-h>', { desc = 'Move focus to the left window' })
vim.keymap.set('n', '<C-l>', '<C-w><C-l>', { desc = 'Move focus to the right window' })
vim.keymap.set('n', '<C-j>', '<C-w><C-j>', { desc = 'Move focus to the lower window' })
vim.keymap.set('n', '<C-k>', '<C-w><C-k>', { desc = 'Move focus to the upper window' })
`;

  return initContent;
};

export const downloadFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};