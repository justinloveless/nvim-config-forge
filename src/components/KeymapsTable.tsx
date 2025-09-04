import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Keyboard } from 'lucide-react';

interface KeymapConfig {
  [key: string]: string;
}

interface KeymapsTableProps {
  leaderKey: string;
  keymaps: KeymapConfig;
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

const KeymapsTable: React.FC<KeymapsTableProps> = ({
  leaderKey,
  keymaps,
  onLeaderKeyChange,
  onKeymapChange,
}) => {
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
                      value={keymaps[action.id] || ''}
                      onChange={(e) => onKeymapChange(action.id, e.target.value)}
                      placeholder={`<leader>${getDefaultKeymap(action.id)}`}
                      className="font-mono bg-background/50 border-border focus:border-nvim-green/50 max-w-32"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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

export default KeymapsTable;