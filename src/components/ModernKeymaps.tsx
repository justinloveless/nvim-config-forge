import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Search, Keyboard, RotateCcw, FolderTree, Search as SearchIcon, Terminal, GitBranch, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import KeyChordInput from './KeyChordInput';

const ResetIcon = RotateCcw;

interface KeymapConfig {
  [key: string]: string;
}

interface ModernKeymapsProps {
  leaderKey: string;
  keymaps: KeymapConfig;
  selectedPlugins: string[];
  onLeaderKeyChange: (leader: string) => void;
  onKeymapChange: (action: string, keymap: string) => void;
}

interface KeymapAction {
  id: string;
  name: string;
  description: string;
}

interface KeymapSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  actions: KeymapAction[];
  pluginId?: string;
}

const LEADER_OPTIONS = [
  { value: ' ', label: 'Space (Recommended)' },
  { value: '\\', label: 'Backslash (\\)' },
  { value: ',', label: 'Comma (,)' },
  { value: ';', label: 'Semicolon (;)' },
];

const KEYMAP_SECTIONS: KeymapSection[] = [
  {
    id: 'general',
    title: 'General Actions',
    description: 'Core Neovim keybindings for common operations',
    icon: <Keyboard className="w-5 h-5" />,
    actions: [
      { id: 'command_mode', name: 'Command Mode', description: 'Enter command mode (map ; to :)' },
      { id: 'save_file', name: 'Save File', description: 'Save current file' },
      { id: 'quit', name: 'Quit', description: 'Quit Neovim' },
      { id: 'select_all', name: 'Select All', description: 'Select all text' },
      { id: 'search_replace', name: 'Search & Replace', description: 'Search and replace' },
    ]
  },
  {
    id: 'navigation',
    title: 'Navigation & Buffers',
    description: 'Window, buffer, and navigation controls',
    icon: <Terminal className="w-5 h-5" />,
    actions: [
      { id: 'split_horizontal', name: 'Split Horizontal', description: 'Split window horizontally' },
      { id: 'split_vertical', name: 'Split Vertical', description: 'Split window vertically' },
      { id: 'buffer_next', name: 'Next Buffer', description: 'Switch to next buffer' },
      { id: 'buffer_prev', name: 'Previous Buffer', description: 'Switch to previous buffer' },
      { id: 'buffer_close', name: 'Close Buffer', description: 'Close current buffer' },
      { id: 'terminal_toggle', name: 'Terminal', description: 'Open terminal' },
    ]
  },
  {
    id: 'display',
    title: 'Display Options',
    description: 'Visual and display-related toggles',
    icon: <Wrench className="w-5 h-5" />,
    actions: [
      { id: 'toggle_wrap', name: 'Toggle Wrap', description: 'Toggle line wrapping' },
      { id: 'toggle_numbers', name: 'Toggle Numbers', description: 'Toggle line numbers' },
    ]
  }
];

const PLUGIN_SECTIONS: { [key: string]: KeymapSection } = {
  'nvim-tree': {
    id: 'nvim-tree',
    title: 'File Explorer',
    description: 'NvimTree file explorer keybindings',
    icon: <FolderTree className="w-5 h-5" />,
    pluginId: 'nvim-tree',
    actions: [
      { id: 'nvim_tree_toggle', name: 'Toggle File Tree', description: 'Open/close file explorer' },
      { id: 'nvim_tree_focus', name: 'Focus File Tree', description: 'Focus on file explorer' },
      { id: 'nvim_tree_find_file', name: 'Find Current File', description: 'Find current file in tree' },
    ]
  },
  'telescope': {
    id: 'telescope',
    title: 'Fuzzy Finder',
    description: 'Telescope search and navigation',
    icon: <SearchIcon className="w-5 h-5" />,
    pluginId: 'telescope',
    actions: [
      { id: 'telescope_find_files', name: 'Find Files', description: 'Search and open files' },
      { id: 'telescope_live_grep', name: 'Live Grep', description: 'Search text in files' },
      { id: 'telescope_buffers', name: 'Buffers', description: 'List and switch buffers' },
      { id: 'telescope_help_tags', name: 'Help Tags', description: 'Search help documentation' },
      { id: 'telescope_git_files', name: 'Git Files', description: 'Search git-tracked files' },
    ]
  },
  'tabbufline': {
    id: 'tabbufline',
    title: 'Tab & Buffer Management',
    description: 'Tab and buffer navigation controls',
    icon: <Terminal className="w-5 h-5" />,
    pluginId: 'tabbufline',
    actions: [
      { id: 'tabbufline_next_tab', name: 'Next Tab', description: 'Switch to next tab' },
      { id: 'tabbufline_prev_tab', name: 'Previous Tab', description: 'Switch to previous tab' },
      { id: 'tabbufline_close_tab', name: 'Close Tab', description: 'Close current tab' },
      { id: 'tabbufline_next_buffer', name: 'Next Buffer', description: 'Switch to next buffer in tab' },
      { id: 'tabbufline_prev_buffer', name: 'Previous Buffer', description: 'Switch to previous buffer in tab' },
      { id: 'tabbufline_close_buffer', name: 'Close Buffer', description: 'Close current buffer' },
    ]
  },
  'nvim-dap': {
    id: 'nvim-dap',
    title: 'Debugger',
    description: 'Debug adapter protocol keybindings',
    icon: <Terminal className="w-5 h-5" />,
    pluginId: 'nvim-dap',
    actions: [
      { id: 'dap_toggle_breakpoint', name: 'Toggle Breakpoint', description: 'Set/remove breakpoint' },
      { id: 'dap_continue', name: 'Continue', description: 'Continue debugging' },
      { id: 'dap_step_over', name: 'Step Over', description: 'Step over line' },
      { id: 'dap_step_into', name: 'Step Into', description: 'Step into function' },
      { id: 'dap_step_out', name: 'Step Out', description: 'Step out of function' },
    ]
  },
  'gitsigns': {
    id: 'gitsigns',
    title: 'Git Integration',
    description: 'Git change navigation and management',
    icon: <GitBranch className="w-5 h-5" />,
    pluginId: 'gitsigns',
    actions: [
      { id: 'gitsigns_next_hunk', name: 'Next Hunk', description: 'Go to next git change' },
      { id: 'gitsigns_prev_hunk', name: 'Previous Hunk', description: 'Go to previous git change' },
      { id: 'gitsigns_stage_hunk', name: 'Stage Hunk', description: 'Stage current change' },
      { id: 'gitsigns_reset_hunk', name: 'Reset Hunk', description: 'Reset current change' },
      { id: 'gitsigns_preview_hunk', name: 'Preview Hunk', description: 'Preview git change' },
    ]
  },
  'which-key': {
    id: 'which-key',
    title: 'Keybinding Help',
    description: 'Which-key helper keybindings',
    icon: <Wrench className="w-5 h-5" />,
    pluginId: 'which-key',
    actions: [
      { id: 'which_key_show', name: 'Show Keybindings', description: 'Display available keybindings' },
    ]
  }
};

const DEFAULT_KEYMAPS: { [key: string]: string } = {
  // General
  'command_mode': ';',
  'save_file': '<leader>w',
  'quit': '<leader>q',
  'select_all': '<leader>a',
  'search_replace': '<leader>sr',
  
  // Navigation
  'split_horizontal': '<leader>s',
  'split_vertical': '<leader>v',
  'buffer_next': '<leader>bn',
  'buffer_prev': '<leader>bp',
  'buffer_close': '<leader>bd',
  'terminal_toggle': '<leader>t',
  
  // Display
  'toggle_wrap': '<leader>tw',
  'toggle_numbers': '<leader>tn',
  
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
  
  // Tabbufline
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

const ModernKeymaps: React.FC<ModernKeymapsProps> = ({
  leaderKey,
  keymaps,
  selectedPlugins,
  onLeaderKeyChange,
  onKeymapChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('general');

  // Get visible sections based on selected plugins
  const visibleSections = useMemo(() => {
    const sections = [...KEYMAP_SECTIONS];
    
    // Add plugin sections for selected plugins
    selectedPlugins.forEach(pluginId => {
      const pluginSection = PLUGIN_SECTIONS[pluginId];
      if (pluginSection) {
        sections.push(pluginSection);
      }
    });
    
    return sections;
  }, [selectedPlugins]);

  // Filter actions based on search query
  const getVisibleActions = (actions: KeymapAction[]) => {
    if (!searchQuery.trim()) return actions;
    
    const query = searchQuery.toLowerCase();
    return actions.filter(action => 
      action.name.toLowerCase().includes(query) ||
      action.description.toLowerCase().includes(query) ||
      action.id.toLowerCase().includes(query)
    );
  };

  // Check if a keymap has been changed from default
  const isKeymapChanged = (actionId: string): boolean => {
    const currentValue = keymaps[actionId] || DEFAULT_KEYMAPS[actionId] || '';
    const defaultValue = DEFAULT_KEYMAPS[actionId] || '';
    return currentValue !== defaultValue;
  };

  // Reset single keymap to default
  const resetSingleKeymap = (actionId: string) => {
    const defaultValue = DEFAULT_KEYMAPS[actionId] || '';
    onKeymapChange(actionId, defaultValue);
  };

  // Initialize default keymaps
  useEffect(() => {
    const initializeDefaults = () => {
      // Initialize general keymaps
      KEYMAP_SECTIONS.forEach(section => {
        section.actions.forEach(action => {
          if (!keymaps[action.id]) {
            const defaultValue = DEFAULT_KEYMAPS[action.id];
            if (defaultValue) {
              onKeymapChange(action.id, defaultValue);
            }
          }
        });
      });

      // Initialize plugin keymaps
      selectedPlugins.forEach(pluginId => {
        const pluginSection = PLUGIN_SECTIONS[pluginId];
        if (pluginSection) {
          pluginSection.actions.forEach(action => {
            if (!keymaps[action.id]) {
              const defaultValue = DEFAULT_KEYMAPS[action.id];
              if (defaultValue) {
                onKeymapChange(action.id, defaultValue);
              }
            }
          });
        }
      });
    };

    initializeDefaults();
  }, [selectedPlugins, keymaps, onKeymapChange]);

  // Get current section
  const currentSection = visibleSections.find(section => section.id === selectedSection) || visibleSections[0];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Keyboard className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Custom Keymaps
          </h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Configure your key bindings. Click any input to record new key combinations, or type custom bindings manually.
        </p>
      </div>

      {/* Leader Key Configuration */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Leader Key Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="leader-key" className="text-sm font-medium min-w-fit">
              Leader Key:
            </Label>
            <Select value={leaderKey} onValueChange={onLeaderKeyChange}>
              <SelectTrigger className="max-w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEADER_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            The leader key acts as a prefix for most keybindings. Space is recommended for ergonomics.
          </p>
        </CardContent>
      </Card>

      {/* Main Keymaps Interface */}
      <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
        {/* Left Sidebar - Categories */}
        <div className="col-span-3">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Categories</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search keymaps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {visibleSections.map((section) => {
                  const visibleActions = getVisibleActions(section.actions);
                  const hasVisibleActions = visibleActions.length > 0;
                  
                  if (!hasVisibleActions && searchQuery.trim()) return null;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors rounded-none",
                        selectedSection === section.id
                          ? "bg-muted text-primary font-medium border-r-2 border-primary"
                          : "hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      {section.icon}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{section.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {hasVisibleActions ? `${visibleActions.length} keybinding${visibleActions.length !== 1 ? 's' : ''}` : 'No matches'}
                        </div>
                      </div>
                      {section.pluginId && (
                        <Badge variant="secondary" className="text-xs">
                          Plugin
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content - Keymaps */}
        <div className="col-span-9">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                {currentSection.icon}
                <div>
                  <CardTitle className="text-primary">{currentSection.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentSection.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {getVisibleActions(currentSection.actions).map((action, index) => (
                  <div key={action.id}>
                    <div className="flex items-start gap-6">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium text-base">
                            {action.name}
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-56 flex-shrink-0">
                          <KeyChordInput
                            value={keymaps[action.id] || DEFAULT_KEYMAPS[action.id] || ''}
                            onChange={(value) => onKeymapChange(action.id, value)}
                            leaderKey={leaderKey}
                            placeholder="No binding"
                          />
                        </div>
                        <div className="w-8 flex justify-center flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetSingleKeymap(action.id)}
                            className={cn(
                              "h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-opacity",
                              isKeymapChanged(action.id) ? "opacity-100" : "opacity-0 pointer-events-none"
                            )}
                            title={`Reset ${action.name} to default`}
                          >
                            <ResetIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {index < getVisibleActions(currentSection.actions).length - 1 && (
                      <Separator className="mt-8" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center p-4 bg-card/50 rounded-lg border border-border max-w-4xl mx-auto">
        <p className="text-sm text-muted-foreground">
          <strong className="text-primary">Tip:</strong> Click any keymap input to record key combinations, 
          or type custom bindings manually. Use Ctrl+C, Alt+F, Shift+Tab, etc. for modifier combinations.
        </p>
      </div>
    </div>
  );
};

export default ModernKeymaps;