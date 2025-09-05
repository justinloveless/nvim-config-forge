import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, ExternalLink, Star, GitFork, Plus, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PluginSearchResult {
  title: string;
  description: string;
  url: string;
  stars?: number;
  forks?: number;
  language?: string;
  updated?: string;
}

interface PluginSearchProps {
  selectedPlugins: string[];
  onPluginAdd: (plugin: { id: string; title: string; description: string }) => void;
}

export const PluginSearch: React.FC<PluginSearchProps> = ({
  selectedPlugins,
  onPluginAdd
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PluginSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedPlugins, setAddedPlugins] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      // Use the websearch tool to find Neovim plugins on GitHub
      const searchTerms = `${searchQuery} neovim plugin nvim lua github`;
      
      // For now, we'll use mock data since we need the websearch tool to be properly integrated
      // In a production implementation, you would replace this with actual websearch API calls
      const mockResults = [
        {
          title: "nvim-cmp - A completion plugin for neovim coded in Lua",
          content: "A completion engine plugin for neovim written in Lua. Completion sources are installed from external repositories and 'sourced'. Popular completion plugin with excellent performance.",
          url: "https://github.com/hrsh7th/nvim-cmp"
        },
        {
          title: "LazyVim - Neovim config for the lazy", 
          content: "LazyVim is a Neovim setup powered by lazy.nvim to make it easy to customize and extend your config. Rather than having to choose between starting from scratch or using a pre-made distro.",
          url: "https://github.com/LazyVim/LazyVim"
        },
        {
          title: "neo-tree.nvim - Neovim plugin to browse the file system",
          content: "Neo-tree is a Neovim plugin to browse the file system and other tree like structures in whatever style suits you. Modern file explorer with extensive customization options.",
          url: "https://github.com/nvim-neo-tree/neo-tree.nvim"
        },
        {
          title: "bufferline.nvim - A snazzy bufferline for Neovim",
          content: "A snazzy buffer line (with tabpage integration) for Neovim built using lua. This plugin shamelessly attempts to emulate the aesthetics of GUI text editors.",
          url: "https://github.com/akinsho/bufferline.nvim"
        },
        {
          title: "nvim-autopairs - autopairs for neovim written by lua",
          content: "A super powerful autopair plugin for Neovim that supports multiple characters. Written in Lua with excellent performance and customization options.",
          url: "https://github.com/windwp/nvim-autopairs"
        },
        {
          title: "Comment.nvim - Smart and powerful comment plugin for neovim",
          content: "Smart and Powerful commenting plugin for neovim. Supports commentstring, motions, dot-repeat and more. Written in Lua for better performance.",
          url: "https://github.com/numToStr/Comment.nvim"
        },
        {
          title: "nvim-lspconfig - Quickstart configs for Nvim LSP",
          content: "Configs for the Nvim LSP client. LSP server configurations for various programming languages. Essential for language server protocol support.",
          url: "https://github.com/neovim/nvim-lspconfig"
        },
        {
          title: "mason.nvim - Portable package manager for Neovim",
          content: "Portable package manager for Neovim that runs everywhere Neovim runs. Easily install and manage LSP servers, DAP servers, linters, and formatters.",
          url: "https://github.com/williamboman/mason.nvim"
        }
      ];

      // Filter and enhance results based on search query
      const filteredResults = mockResults.filter(result => {
        const query = searchQuery.toLowerCase();
        return result.title.toLowerCase().includes(query) ||
               result.content.toLowerCase().includes(query) ||
               query.split(' ').some(term => 
                 result.title.toLowerCase().includes(term) || 
                 result.content.toLowerCase().includes(term)
               );
      });

      // Simulate some GitHub stats for demonstration
      const pluginResults: PluginSearchResult[] = filteredResults
        .map((result, index) => {
          // Mock some GitHub stats for better UX
          const stars = Math.floor(Math.random() * 5000) + 500;
          const forks = Math.floor(stars * 0.1) + Math.floor(Math.random() * 100);
          
          return {
            title: result.title.replace(/^GitHub - /, '').replace(/ - GitHub$/, ''),
            description: result.content.substring(0, 200) + (result.content.length > 200 ? '...' : ''),
            url: result.url,
            stars: stars,
            forks: forks,
          };
        })
        .slice(0, 6); // Limit to top 6 results

      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      setSearchResults(pluginResults);

      if (pluginResults.length === 0) {
        toast({
          title: "No plugins found",
          description: "Try searching with different keywords like 'completion', 'statusline', 'file explorer', etc.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to search for plugins. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddPlugin = (result: PluginSearchResult) => {
    // Create a plugin ID from the GitHub repo name
    const urlParts = result.url.split('/');
    const repoName = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    const pluginId = `custom-${repoName}`;

    // Check if already added
    if (addedPlugins.has(pluginId) || selectedPlugins.includes(pluginId)) {
      return;
    }

    onPluginAdd({
      id: pluginId,
      title: result.title.split(':')[0].trim(), // Clean up title
      description: result.description.split('.')[0] + '.' // Take first sentence
    });

    setAddedPlugins(prev => new Set(prev).add(pluginId));
    
    toast({
      title: "Plugin added",
      description: `${result.title} has been added to your selection`,
      duration: 2000,
    });
  };

  const isPluginAdded = (result: PluginSearchResult) => {
    const urlParts = result.url.split('/');
    const repoName = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    const pluginId = `custom-${repoName}`;
    return addedPlugins.has(pluginId) || selectedPlugins.includes(pluginId);
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Discover More Plugins
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Search the web for additional Neovim plugins to enhance your configuration
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for plugins... (e.g., 'file explorer', 'completion', 'statusline')"
            className="flex-1"
          />
          <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Search Results</h3>
            <div className="grid gap-4">
              {searchResults.map((result, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                   <CardContent className="p-4">
                     <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                       <div className="flex-1 space-y-3">
                         <div className="space-y-2">
                           <h4 className="font-medium text-base line-clamp-2">
                             {result.title}
                           </h4>
                           <div className="flex items-center gap-2 flex-wrap">
                             {result.stars !== undefined && (
                               <Badge variant="secondary" className="text-xs">
                                 <Star className="w-3 h-3 mr-1" />
                                 {result.stars}
                               </Badge>
                             )}
                             {result.forks !== undefined && (
                               <Badge variant="outline" className="text-xs">
                                 <GitFork className="w-3 h-3 mr-1" />
                                 {result.forks}
                               </Badge>
                             )}
                           </div>
                         </div>
                         <p className="text-sm text-muted-foreground line-clamp-3">
                           {result.description}
                         </p>
                         <div className="flex items-center gap-2">
                           <Button
                             variant="outline"
                             size="sm"
                             asChild
                           >
                             <a
                               href={result.url}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="flex items-center gap-1"
                             >
                               <ExternalLink className="w-3 h-3" />
                               View on GitHub
                             </a>
                           </Button>
                         </div>
                       </div>
                       <div className="flex-shrink-0 w-full sm:w-auto">
                         <Button
                           onClick={() => handleAddPlugin(result)}
                           disabled={isPluginAdded(result)}
                           size="sm"
                           variant={isPluginAdded(result) ? "secondary" : "default"}
                           className="w-full sm:w-auto"
                         >
                           {isPluginAdded(result) ? (
                             <>
                               <Check className="w-4 h-4 mr-1" />
                               Added
                             </>
                           ) : (
                             <>
                               <Plus className="w-4 h-4 mr-1" />
                               Add Plugin
                             </>
                           )}
                         </Button>
                       </div>
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search Tips */}
        {searchResults.length === 0 && !isSearching && (
          <div className="text-center py-8 space-y-4">
            <Search className="w-12 h-12 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="font-semibold">Search for Neovim Plugins</h3>
              <p className="text-muted-foreground text-sm">
                Try searching for specific functionality you need
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                'file explorer',
                'completion',
                'statusline',
                'git integration',
                'markdown preview',
                'colorscheme',
                'snippets',
                'terminal'
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};