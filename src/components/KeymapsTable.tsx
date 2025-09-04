import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Keyboard, FolderTree, Search, Terminal, GitBranch, Wrench } from 'lucide-react';

interface KeymapConfig {
  [key: string]: string;
}

interface KeymapsTableProps {
  leaderKey: string;
  keymaps: KeymapConfig;
  selectedPlugins: string[];
  onLeaderKeyChange: (leader: string) => void;
  onKeymapChange: (action: string, keymap: string) => void;
}

const KEYMAP_ACTIONS = [
  { id: 'split_horizontal', name: 'Split Horizontal', description: 'Split window horizontally' },
  { id: 'split_vertical', name: 'Split Vertical', description: 'Split window vertically' },
  { id: 'buffer_next', name: 'Next Buffer', description: 'Switch to next buffer' },
  { id: 'buffer_prev', name: 'Previous Buffer', description: 'Switch to previous buffer' },  
  { id: 'buffer_close', name: 'Close Buffer', description: 'Close current buffer' },
  { id: 'toggle_wrap', name: 'Toggle Wrap', description: 'Toggle line wrapping' },
  { id: 'toggle_numbers', name: 'Toggle Numbers', description: 'Toggle line numbers' },
  { id: 'search_replace', name: 'Search & Replace', description: 'Search and replace' },
  { id: 'select_all', name: 'Select All', description: 'Select all text' },
  { id: 'terminal_toggle', name: 'Terminal', description: 'Open terminal' },
  { id: 'save_file', name: 'Save File', description: 'Save current file' },
  { id: 'quit', name: 'Quit', description: 'Quit Neovim' },
];

const PLUGIN_KEYMAPS = {
  'nvim-tree': {
    title: 'NvimTree - File Explorer',
    icon: <FolderTree className="w-5 h-5" />,
    keymaps: [
      { id: 'nvim_tree_toggle', name: 'Toggle File Tree', description: 'Open/close file explorer' },
      { id: 'nvim_tree_focus', name: 'Focus File Tree', description: 'Focus on file explorer' },
      { id: 'nvim_tree_find_file', name: 'Find Current File', description: 'Find current file in tree' },
    ]
  },
  'telescope': {
    title: 'Telescope - Fuzzy Finder',
    icon: <Search className="w-5 h-5" />,
    keymaps: [
      { id: 'telescope_find_files', name: 'Find Files', description: 'Search and open files' },
      { id: 'telescope_live_grep', name: 'Live Grep', description: 'Search text in files' },
      { id: 'telescope_buffers', name: 'Buffers', description: 'List and switch buffers' },
      { id: 'telescope_help_tags', name: 'Help Tags', description: 'Search help documentation' },
      { id: 'telescope_git_files', name: 'Git Files', description: 'Search git-tracked files' },
    ]
  },
  'tabbufline': {
    title: 'Tabbufline - Tab & Buffer Management',
    icon: <Terminal className="w-5 h-5" />,
    keymaps: [
      { id: 'tabbufline_next_tab', name: 'Next Tab', description: 'Switch to next tab' },
      { id: 'tabbufline_prev_tab', name: 'Previous Tab', description: 'Switch to previous tab' },
      { id: 'tabbufline_close_tab', name: 'Close Tab', description: 'Close current tab' },
      { id: 'tabbufline_next_buffer', name: 'Next Buffer', description: 'Switch to next buffer in tab' },
      { id: 'tabbufline_prev_buffer', name: 'Previous Buffer', description: 'Switch to previous buffer in tab' },
      { id: 'tabbufline_close_buffer', name: 'Close Buffer', description: 'Close current buffer' },
    ]
  },
  'nvim-dap': {
    title: 'nvim-dap - Debugger',
    icon: <Terminal className="w-5 h-5" />,
    keymaps: [
      { id: 'dap_toggle_breakpoint', name: 'Toggle Breakpoint', description: 'Set/remove breakpoint' },
      { id: 'dap_continue', name: 'Continue', description: 'Continue debugging' },
      { id: 'dap_step_over', name: 'Step Over', description: 'Step over line' },
      { id: 'dap_step_into', name: 'Step Into', description: 'Step into function' },
      { id: 'dap_step_out', name: 'Step Out', description: 'Step out of function' },
    ]
  },
  'gitsigns': {
    title: 'GitSigns - Git Integration',
    icon: <GitBranch className="w-5 h-5" />,
    keymaps: [
      { id: 'gitsigns_next_hunk', name: 'Next Hunk', description: 'Go to next git change' },
      { id: 'gitsigns_prev_hunk', name: 'Previous Hunk', description: 'Go to previous git change' },
      { id: 'gitsigns_stage_hunk', name: 'Stage Hunk', description: 'Stage current change' },
      { id: 'gitsigns_reset_hunk', name: 'Reset Hunk', description: 'Reset current change' },
      { id: 'gitsigns_preview_hunk', name: 'Preview Hunk', description: 'Preview git change' },
    ]
  },
  'which-key': {
    title: 'Which Key - Keybinding Help',
    icon: <Wrench className="w-5 h-5" />,
    keymaps: [
      { id: 'which_key_show', name: 'Show Keybindings', description: 'Display available keybindings' },
    ]
  }
};

const KeymapsTable: React.FC<KeymapsTableProps> = ({
  leaderKey,
  keymaps,
  selectedPlugins,
  onLeaderKeyChange,
  onKeymapChange,
}) => {
  // Initialize default values for keymaps if not already set
  useEffect(() => {
    const initializeDefaults = () => {
      // Initialize general keymaps
      KEYMAP_ACTIONS.forEach(action => {
        if (!keymaps[action.id]) {
          const defaultValue = getDefaultKeymap(action.id);
          if (defaultValue) {
            onKeymapChange(action.id, `<leader>${defaultValue}`);
          }
        }
      });

      // Initialize plugin keymaps for selected plugins
      selectedPlugins.forEach(pluginId => {
        const pluginConfig = PLUGIN_KEYMAPS[pluginId as keyof typeof PLUGIN_KEYMAPS];
        if (pluginConfig) {
          pluginConfig.keymaps.forEach(keymap => {
            if (!keymaps[keymap.id]) {
              const defaultValue = getDefaultPluginKeymap(keymap.id);
              if (defaultValue) {
                onKeymapChange(keymap.id, defaultValue);
              }
            }
          });
        }
      });
    };

    initializeDefaults();
  }, [selectedPlugins, keymaps, onKeymapChange]);
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Keyboard className="w-6 h-6 text-nvim-green" />
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Custom Keymaps
          </h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Configure your key bindings. Use &lt;leader&gt; as a placeholder for your leader key. 
          Leave blank to skip mapping an action.
        </p>
      </div>

      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-nvim-green">Leader Key Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="leader-key" className="text-sm font-medium min-w-fit">
              Leader Key:
            </Label>
            <Input
              id="leader-key"
              value={leaderKey}
              onChange={(e) => onLeaderKeyChange(e.target.value)}
              placeholder="Space"
              className="max-w-32 font-mono bg-background/50 border-border focus:border-nvim-green/50"
            />
            <span className="text-sm text-muted-foreground">
              Common choices: Space, \, ,
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-nvim-green">Key Bindings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-background/5">
                <TableHead className="text-nvim-green">Action</TableHead>
                <TableHead className="text-nvim-green">Description</TableHead>
                <TableHead className="text-nvim-green">Keymap</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {KEYMAP_ACTIONS.map((action) => (
                <TableRow key={action.id} className="border-border hover:bg-background/5">
                  <TableCell className="font-medium">{action.name}</TableCell>
                  <TableCell className="text-muted-foreground">{action.description}</TableCell>
                  <TableCell>
                    <Input
                      value={keymaps[action.id] || `<leader>${getDefaultKeymap(action.id)}`}
                      onChange={(e) => onKeymapChange(action.id, e.target.value)}
                      className="font-mono bg-background/50 border-border focus:border-nvim-green/50 max-w-32"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Plugin-specific keymaps */}
      {selectedPlugins?.map(pluginId => {
        const pluginConfig = PLUGIN_KEYMAPS[pluginId as keyof typeof PLUGIN_KEYMAPS];
        if (!pluginConfig) return null;
        
        return (
          <Card key={pluginId} className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-nvim-green flex items-center gap-2">
                {pluginConfig.icon}
                Key Bindings - {pluginConfig.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-background/5">
                    <TableHead className="text-nvim-green">Action</TableHead>
                    <TableHead className="text-nvim-green">Description</TableHead>
                    <TableHead className="text-nvim-green">Keymap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pluginConfig.keymaps.map((keymap) => (
                    <TableRow key={keymap.id} className="border-border hover:bg-background/5">
                      <TableCell className="font-medium">{keymap.name}</TableCell>
                      <TableCell className="text-muted-foreground">{keymap.description}</TableCell>
                      <TableCell>
                        <Input
                          value={keymaps[keymap.id] || getDefaultPluginKeymap(keymap.id)}
                          onChange={(e) => onKeymapChange(keymap.id, e.target.value)}
                          className="font-mono bg-background/50 border-border focus:border-nvim-green/50 max-w-32"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      <div className="text-center p-4 bg-card/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <strong className="text-nvim-green">Tip:</strong> Use &lt;leader&gt; as a prefix for most keymaps. 
          You can also use Ctrl (C-), Alt (A-), or combinations like &lt;leader&gt;f for file operations.
        </p>
      </div>
    </div>
  );
};

const getDefaultKeymap = (actionId: string): string => {
  const defaults: { [key: string]: string } = {
    'split_horizontal': 's',
    'split_vertical': 'v',
    'buffer_next': 'bn',
    'buffer_prev': 'bp',
    'buffer_close': 'bd',
    'toggle_wrap': 'tw',
    'toggle_numbers': 'tn',
    'search_replace': 'sr',
    'select_all': 'a',
    'terminal_toggle': 't',
    'save_file': 'w',
    'quit': 'q',
  };
  return defaults[actionId] || '';
};

const getDefaultPluginKeymap = (keymapId: string): string => {
  const pluginDefaults: { [key: string]: string } = {
    // NvimTree
    'nvim_tree_toggle': '<leader>e',
    'nvim_tree_focus': '<leader>ef',
    'nvim_tree_find_file': '<leader>ec',
    
    // Telescope
    'telescope_find_files': '<leader>ff',
    'telescope_live_grep': '<leader>fg',
    'telescope_buffers': '<leader>fb',
    'telescope_help_tags': '<leader>fh',
    'telescope_git_files': '<leader>gf',
    
    // Tabbufline (NvChad UI)
    'tabbufline_next_tab': 'gt',
    'tabbufline_prev_tab': 'gT',
    'tabbufline_close_tab': '<leader>tc',
    'tabbufline_next_buffer': '<Tab>',
    'tabbufline_prev_buffer': '<S-Tab>',
    'tabbufline_close_buffer': '<leader>x',
    
    // nvim-dap
    'dap_toggle_breakpoint': '<leader>db',
    'dap_continue': '<leader>dc',
    'dap_step_over': '<leader>do',
    'dap_step_into': '<leader>di',
    'dap_step_out': '<leader>du',
    
    // GitSigns
    'gitsigns_next_hunk': ']c',
    'gitsigns_prev_hunk': '[c',
    'gitsigns_stage_hunk': '<leader>hs',
    'gitsigns_reset_hunk': '<leader>hr',
    'gitsigns_preview_hunk': '<leader>hp',
    
    // Which Key
    'which_key_show': '<leader>?',
  };
  return pluginDefaults[keymapId] || '';
};

export default KeymapsTable;