import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ManualPluginEntry {
  name: string;
  description: string;
  installCode: string;
}

interface PluginSearchProps {
  selectedPlugins: string[];
  onPluginAdd: (plugin: { id: string; title: string; description: string }) => void;
}

export const PluginSearch: React.FC<PluginSearchProps> = ({
  selectedPlugins,
  onPluginAdd
}) => {
  const [pluginEntry, setPluginEntry] = useState<ManualPluginEntry>({
    name: '',
    description: '',
    installCode: ''
  });
  const { toast } = useToast();

  const handleAddPlugin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pluginEntry.name.trim() || !pluginEntry.installCode.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a plugin name and installation code.",
        variant: "destructive",
      });
      return;
    }

    const pluginId = `custom-${pluginEntry.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    // Check if already added
    if (selectedPlugins.includes(pluginId)) {
      toast({
        title: "Plugin already added",
        description: `${pluginEntry.name} is already in your selection.`,
        variant: "default",
      });
      return;
    }

    onPluginAdd({
      id: pluginId,
      title: pluginEntry.name,
      description: pluginEntry.description || 'Custom plugin'
    });
    
    // Reset form
    setPluginEntry({
      name: '',
      description: '',
      installCode: ''
    });
    
    toast({
      title: "Plugin added",
      description: `${pluginEntry.name} has been added to your selection`,
      duration: 2000,
    });
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          Add Custom Plugin
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manually add your own Neovim plugins with custom Lua installation code
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddPlugin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plugin-name">Plugin Name *</Label>
            <Input
              id="plugin-name"
              value={pluginEntry.name}
              onChange={(e) => setPluginEntry(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., nvim-treesitter, lualine.nvim"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plugin-description">Description (optional)</Label>
            <Input
              id="plugin-description"
              value={pluginEntry.description}
              onChange={(e) => setPluginEntry(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of what this plugin does"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="install-code">Lua Installation Code *</Label>
            <Textarea
              id="install-code"
              value={pluginEntry.installCode}
              onChange={(e) => setPluginEntry(prev => ({ ...prev, installCode: e.target.value }))}
              placeholder={`-- Example installation code:
{
  'nvim-treesitter/nvim-treesitter',
  build = ':TSUpdate',
  config = function()
    require('nvim-treesitter.configs').setup({
      ensure_installed = { 'lua', 'javascript', 'python' },
      highlight = { enable = true },
    })
  end,
}`}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <Button type="submit" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Plugin
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Installation Code Tips:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use standard lazy.nvim plugin specification format</li>
            <li>• Include the GitHub repository path (e.g., 'author/plugin-name')</li>
            <li>• Add configuration, dependencies, and build commands as needed</li>
            <li>• The code will be included directly in your generated config</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};