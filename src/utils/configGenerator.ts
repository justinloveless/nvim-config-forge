interface NvimConfig {
  languages: string[];
  theme: string;
  plugins: string[];
  settings: string[];
  leaderKey: string;
  keymaps: { [key: string]: string };
}

export const generateInitLua = (config: NvimConfig): string => {
  const { languages, theme, plugins, settings, leaderKey, keymaps } = config;

  // Add leader key mapping first (before any plugins)
  const leaderKeyDisplay = leaderKey === ' ' ? 'Space' : leaderKey;
  const leaderKeyLua = leaderKey === ' ' ? "' '" : `'${leaderKey}'`;

  let initContent = `-- Generated Neovim Configuration
-- Languages: ${languages.join(', ')}
-- Theme: ${theme}
-- Generated on: ${new Date().toLocaleDateString()}

-- Set leader key (${leaderKeyDisplay}) - Must be set before plugins load
vim.g.mapleader = ${leaderKeyLua}
vim.g.maplocalleader = ${leaderKeyLua}

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

  // Add plugin manager setup (always include if languages are selected or plugins are chosen)
  if (plugins.length > 0 || languages.length > 0) {
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

    // Auto-include Mason and LSP for selected languages
    if (languages.length > 0) {
      initContent += `  -- LSP Manager (auto-included for language support)
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

      // Add only LSP servers based on selected languages
      const lspServers = languages.map(lang => {
        const serverMap: { [key: string]: string } = {
          'typescript': 'ts_ls',
          'javascript': 'ts_ls',
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
        automatic_installation = false,
      })
      
      -- Setup handlers for automatic LSP server setup
      require("mason-lspconfig").setup_handlers({
        function(server_name)
          require("lspconfig")[server_name].setup({})
        end,
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
        if (server) {
          initContent += `      lspconfig.${server}.setup({ capabilities = capabilities })
`;
        }
      });

      initContent += `    end,
  },
`;

      // Add formatting and linting support
      const hasFormatters = languages.some(lang => 
        ['typescript', 'javascript', 'python', 'rust', 'go', 'c', 'cpp', 'csharp', 'java', 'lua'].includes(lang)
      );
      
      if (hasFormatters) {
        initContent += `  -- Formatting and Linting (auto-included for selected languages)
  {
    "nvimtools/none-ls.nvim",
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      local null_ls = require("null-ls")
      null_ls.setup({
        sources = {`;

        // Add language-specific formatters (only commonly available ones)
        languages.forEach(lang => {
          switch (lang) {
            case 'typescript':
            case 'javascript':
              initContent += `
          null_ls.builtins.formatting.prettier,`;
              break;
            case 'python':
              initContent += `
          null_ls.builtins.formatting.black,`;
              break;
            case 'rust':
              initContent += `
          null_ls.builtins.formatting.rustfmt,`;
              break;
            case 'lua':
              initContent += `
          null_ls.builtins.formatting.stylua,`;
              break;
          }
        });

        initContent += `
        },
      })
    end,
  },
`;
      }

      // Auto-include completion for languages
      initContent += `  -- Autocompletion (auto-included for language support)
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

    // Add optional plugins
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

      initContent += `  -- Enhanced Syntax highlighting
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

    if (plugins.includes('telescope')) {
      initContent += `  -- Fuzzy finder
  {
    "nvim-telescope/telescope.nvim",
    tag = "0.1.5",
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      local builtin = require('telescope.builtin')
      -- Telescope keymaps will be handled by custom keymaps section
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
      -- NvimTree keymaps will be handled by custom keymaps section
    end,
  },
`;
    }

    if (plugins.includes('tabbufline')) {
      initContent += `  -- NvChad UI for enhanced tabs and buffers
  {
    "nvchad/ui",
    dependencies = { "nvim-tree/nvim-web-devicons", "nvim-lua/plenary.nvim" },
    config = function()
      require("nvconfig")
    end,
  },
`;
    }

    if (plugins.includes('dashboard')) {
      initContent += `  -- Dashboard start screen
  {
    "nvimdev/dashboard-nvim",
    event = "VimEnter",
    config = function()
      require('dashboard').setup({
        theme = 'doom',
        config = {
          header = {
            '',
            '███╗   ██╗███████╗ ██████╗ ██╗   ██╗██╗███╗   ███╗',
            '████╗  ██║██╔════╝██╔═══██╗██║   ██║██║████╗ ████║',
            '██╔██╗ ██║█████╗  ██║   ██║██║   ██║██║██╔████╔██║',
            '██║╚██╗██║██╔══╝  ██║   ██║╚██╗ ██╔╝██║██║╚██╔╝██║',
            '██║ ╚████║███████╗╚██████╔╝ ╚████╔╝ ██║██║ ╚═╝ ██║',
            '╚═╝  ╚═══╝╚══════╝ ╚═════╝   ╚═══╝  ╚═╝╚═╝     ╚═╝',
            '',
          },
          center = {
            { icon = ' ', desc = 'Find File          ', key = 'f', keymap = 'SPC f f', action = 'lua require("telescope.builtin").find_files()' },
            { icon = ' ', desc = 'Recent Files       ', key = 'r', keymap = 'SPC f r', action = 'lua require("telescope.builtin").oldfiles()' },
            { icon = ' ', desc = 'Find Text          ', key = 'g', keymap = 'SPC f g', action = 'lua require("telescope.builtin").live_grep()' },
            { icon = ' ', desc = 'New File           ', key = 'n', keymap = 'SPC f n', action = 'enew' },
            { icon = ' ', desc = 'Quit               ', key = 'q', keymap = 'SPC q q', action = 'qa' },
          },
        },
      })
    end,
  },
`;
    }

    if (plugins.includes('indent-blankline')) {
      initContent += `  -- Indentation guides
  {
    "lukas-reineke/indent-blankline.nvim",
    main = "ibl",
    config = function()
      require("ibl").setup({
        indent = { char = "│" },
        scope = { enabled = false },
      })
    end,
  },
`;
    }

    if (plugins.includes('lualine')) {
      initContent += `  -- Statusline
  {
    "nvim-lualine/lualine.nvim",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    config = function()
      require('lualine').setup({
        options = {
          theme = 'auto',
          component_separators = { left = '', right = ''},
          section_separators = { left = '', right = ''},
        },
      })
    end,
  },
`;
    }

    if (plugins.includes('nvim-surround')) {
      initContent += `  -- Surround text objects
  {
    "kylechui/nvim-surround",
    version = "*",
    event = "VeryLazy",
    config = function()
      require("nvim-surround").setup({})
    end,
  },
`;
    }

    if (plugins.includes('gitsigns')) {
      initContent += `  -- Git integration
  {
    "lewis6991/gitsigns.nvim",
    config = function()
      require('gitsigns').setup({
        signs = {
          add = { text = '+' },
          change = { text = '~' },
          delete = { text = '_' },
          topdelete = { text = '‾' },
          changedelete = { text = '~' },
        },
      })
      -- GitSigns keymaps will be handled by custom keymaps section
    end,
  },
`;
    }

    if (plugins.includes('which-key')) {
      initContent += `  -- Keybinding helper
  {
    "folke/which-key.nvim",
    event = "VeryLazy",
    config = function()
      vim.o.timeout = true
      vim.o.timeoutlen = 300
      require("which-key").setup({})
    end,
  },
`;
    }

    if (plugins.includes('nvim-dap')) {
      initContent += `  -- Debug Adapter Protocol
  {
    "mfussenegger/nvim-dap",
    dependencies = {
      "rcarriga/nvim-dap-ui",
      "nvim-neotest/nvim-nio",
    },
    config = function()
      local dap = require("dap")
      local dapui = require("dapui")
      
      dapui.setup()
      
      dap.listeners.after.event_initialized["dapui_config"] = function()
        dapui.open()
      end
      dap.listeners.before.event_terminated["dapui_config"] = function()
        dapui.close()
      end
      dap.listeners.before.event_exited["dapui_config"] = function()
        dapui.close()
      end
      
      -- DAP keymaps will be handled by custom keymaps section
    end,
  },
`;
    }

    if (plugins.includes('nvim-notify')) {
      initContent += `  -- Enhanced notifications
  {
    "rcarriga/nvim-notify",
    config = function()
      local notify = require("notify")
      notify.setup({
        stages = "fade_in_slide_out",
        timeout = 3000,
      })
      vim.notify = notify
    end,
  },
`;
    }

    initContent += `})

-- NvChad UI configuration file for tabbufline
if vim.fn.isdirectory(vim.fn.stdpath("config") .. "/lua") == 1 then
  vim.g.nvconfig_path = vim.fn.stdpath("config") .. "/lua/nvconfig.lua"
  if vim.fn.filereadable(vim.g.nvconfig_path) == 0 then
    local file = io.open(vim.g.nvconfig_path, "w")
    if file then 
      file:write([[
return {
  ui = {
    tabufline = {
      enabled = true,
      lazyload = true,
      order = { "treeOffset", "buffers", "tabs", "btns" },
    },
  },
}
]])
      file:close()
    end
  end
end

`;
  }

  // Set colorscheme
  if (theme && theme !== 'default') {
    initContent += `-- Set colorcheme
vim.cmd.colorscheme('${theme}')
`;
  }

  // Add window navigation keymaps
  initContent += `\n-- Window navigation
vim.keymap.set('n', '<C-h>', '<C-w><C-h>', { desc = 'Move focus to the left window' })
vim.keymap.set('n', '<C-l>', '<C-w><C-l>', { desc = 'Move focus to the right window' })
vim.keymap.set('n', '<C-j>', '<C-w><C-j>', { desc = 'Move focus to the lower window' })
vim.keymap.set('n', '<C-k>', '<C-w><C-k>', { desc = 'Move focus to the upper window' })
`;

  // Add custom keymaps
  if (Object.keys(keymaps).length > 0) {
    initContent += `\n-- Custom keymaps\n`;
    
    const keymapCommands = {
      'command_mode': ':',
      'split_horizontal': '<cmd>split<CR>',
      'split_vertical': '<cmd>vsplit<CR>',
      'buffer_next': '<cmd>bnext<CR>',
      'buffer_prev': '<cmd>bprev<CR>',
      'buffer_close': '<cmd>bdelete<CR>',
      'toggle_wrap': '<cmd>set wrap!<CR>',
      'toggle_numbers': '<cmd>set number! relativenumber!<CR>',
      'search_replace': ':%s/',
      'select_all': 'ggVG',
      'terminal_toggle': '<cmd>terminal<CR>',
      'save_file': '<cmd>write<CR>',
      'quit': '<cmd>quit<CR>',
      // Tabbufline (NvChad UI)
      'tabbufline_next_tab': '<cmd>tabnext<CR>',
      'tabbufline_prev_tab': '<cmd>tabprevious<CR>',
      'tabbufline_close_tab': '<cmd>tabclose<CR>',
      'tabbufline_next_buffer': 'function() require("nvchad.tabufline").next() end',
      'tabbufline_prev_buffer': 'function() require("nvchad.tabufline").prev() end',
      'tabbufline_close_buffer': 'function() require("nvchad.tabufline").close_buffer() end',
      'nvim_tree_toggle': '<cmd>NvimTreeToggle<CR>',
      'nvim_tree_focus': '<cmd>NvimTreeFocus<CR>',
      'nvim_tree_find_file': '<cmd>NvimTreeFindFile<CR>',
      'telescope_find_files': 'function() require("telescope.builtin").find_files() end',
      'telescope_live_grep': 'function() require("telescope.builtin").live_grep() end',
      'telescope_buffers': 'function() require("telescope.builtin").buffers() end',
      'telescope_help_tags': 'function() require("telescope.builtin").help_tags() end',
      'telescope_git_files': 'function() require("telescope.builtin").git_files() end',
      'dap_toggle_breakpoint': 'function() require("dap").toggle_breakpoint() end',
      'dap_continue': 'function() require("dap").continue() end',
      'dap_step_over': 'function() require("dap").step_over() end',
      'dap_step_into': 'function() require("dap").step_into() end',
      'dap_step_out': 'function() require("dap").step_out() end',
      'gitsigns_next_hunk': 'function() require("gitsigns").next_hunk() end',
      'gitsigns_prev_hunk': 'function() require("gitsigns").prev_hunk() end',
      'gitsigns_stage_hunk': 'function() require("gitsigns").stage_hunk() end',
      'gitsigns_reset_hunk': 'function() require("gitsigns").reset_hunk() end',
      'gitsigns_preview_hunk': 'function() require("gitsigns").preview_hunk() end',
      'which_key_show': '<cmd>WhichKey<CR>'
    };
    
    const keymapDescriptions = {
      'command_mode': 'Enter command mode',
      'split_horizontal': 'Split window horizontally',
      'split_vertical': 'Split window vertically',
      'buffer_next': 'Next buffer',
      'buffer_prev': 'Previous buffer',
      'buffer_close': 'Close buffer',
      'toggle_wrap': 'Toggle line wrap',
      'toggle_numbers': 'Toggle line numbers',
      'search_replace': 'Search and replace',
      'select_all': 'Select all',
      'terminal_toggle': 'Open terminal',
      'save_file': 'Save file',
      'quit': 'Quit',
      // Plugin-specific descriptions
      'nvim_tree_toggle': 'Toggle file explorer',
      'nvim_tree_focus': 'Focus file explorer',
      'nvim_tree_find_file': 'Find current file in explorer',
      'telescope_find_files': 'Find files',
      'telescope_live_grep': 'Search text in files',
      'telescope_buffers': 'List buffers',
      'telescope_help_tags': 'Help tags',
      'telescope_git_files': 'Git files',
      // Tabbufline descriptions
      'tabbufline_next_tab': 'Next tab',
      'tabbufline_prev_tab': 'Previous tab',
      'tabbufline_close_tab': 'Close tab',
      'tabbufline_next_buffer': 'Next buffer in tab',
      'tabbufline_prev_buffer': 'Previous buffer in tab',
      'tabbufline_close_buffer': 'Close buffer',
      'dap_toggle_breakpoint': 'Toggle breakpoint',
      'dap_continue': 'Debug continue',
      'dap_step_over': 'Debug step over',
      'dap_step_into': 'Debug step into',
      'dap_step_out': 'Debug step out',
      'gitsigns_next_hunk': 'Next git hunk',
      'gitsigns_prev_hunk': 'Previous git hunk',
      'gitsigns_stage_hunk': 'Stage git hunk',
      'gitsigns_reset_hunk': 'Reset git hunk',
      'gitsigns_preview_hunk': 'Preview git hunk',
      'which_key_show': 'Show keybindings'
    };
    
    Object.entries(keymaps).forEach(([action, keymap]) => {
      if (keymap.trim() && keymapCommands[action as keyof typeof keymapCommands]) {
        const processedKeymap = keymap.replace(/<leader>/g, '<leader>');
        const command = keymapCommands[action as keyof typeof keymapCommands];
        const description = keymapDescriptions[action as keyof typeof keymapDescriptions];
        
        // Handle function keymaps differently
        if (command.startsWith('function()')) {
          initContent += `vim.keymap.set('n', '${processedKeymap}', ${command}, { desc = '${description}' })\n`;
        } else {
          initContent += `vim.keymap.set('n', '${processedKeymap}', '${command}', { desc = '${description}' })\n`;
        }
      }
    });
  }

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