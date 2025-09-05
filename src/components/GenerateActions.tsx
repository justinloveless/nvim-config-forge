import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Copy, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  Save, 
  Monitor, 
  Package, 
  Stethoscope,
  FileText,
  FolderOpen,
  Settings,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ConfigImporter } from './ConfigImporter';
import { HealthCheckAnalyzer } from './HealthCheckAnalyzer';
import { InstallerScripts } from './InstallerScripts';

interface GenerateActionsProps {
  config: any;
  generatedConfig: string;
  copied: boolean;
  isNvimConnected: boolean;
  hasDirectoryHandle: boolean;
  onDownload: () => void;
  onCopy: () => void;
  onSaveToNvim: () => void;
  onSaveToDirectory: () => void;
  onImportConfig: (config: any) => void;
  onTestConnection: () => Promise<void>;
}

interface ActionCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ACTION_CATEGORIES: ActionCategory[] = [
  {
    id: 'save-nvim',
    title: 'Save to Neovim',
    description: 'Directly save configuration to running Neovim instance',
    icon: <Monitor className="w-5 h-5" />
  },
  {
    id: 'copy-download',
    title: 'Copy & Download',
    description: 'Manually copy or download the generated configuration',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'install-scripts',
    title: 'Installation Scripts',
    description: 'Automated installer scripts for Neovim and configuration',
    icon: <Package className="w-5 h-5" />
  },
  {
    id: 'health-check',
    title: 'Health Check',
    description: 'Analyze and troubleshoot your Neovim installation',
    icon: <Stethoscope className="w-5 h-5" />
  },
  {
    id: 'import-config',
    title: 'Import Config',
    description: 'Import existing Neovim configuration',
    icon: <Settings className="w-5 h-5" />
  }
];

export const GenerateActions: React.FC<GenerateActionsProps> = ({
  config,
  generatedConfig,
  copied,
  isNvimConnected,
  hasDirectoryHandle,
  onDownload,
  onCopy,
  onSaveToNvim,
  onSaveToDirectory,
  onImportConfig,
  onTestConnection
}) => {
  const [selectedCategory, setSelectedCategory] = useState('save-nvim');

  const renderSaveToNvim = () => {
    // Check if user is on mobile
    const isMobile = window.innerWidth < 1024; // lg breakpoint
    
    if (isMobile) {
      return (
        <div className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="text-blue-700 dark:text-blue-300">
                <div className="font-medium text-sm">
                  Desktop Required
                </div>
                <div className="text-sm">
                  Saving directly to your local Neovim requires a desktop computer with Neovim running
                </div>
              </div>
            </div>
          </Alert>
          
          <div className="text-center py-8 space-y-4">
            <Monitor className="w-16 h-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Save to Neovim on Desktop</h3>
              <p className="text-muted-foreground">
                To save your configuration directly to Neovim, you'll need to:
              </p>
            </div>
            <div className="text-left max-w-md mx-auto">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Open this configurator on a desktop computer</li>
                <li>Start Neovim in a terminal</li>
                <li>Run <code className="bg-muted px-1 rounded">:lua require('config_listener').start()</code></li>
                <li>Return to this page to save directly</li>
              </ol>
            </div>
            <div className="pt-4">
              <p className="text-xs text-muted-foreground">
                For now, you can use the "Copy & Download" tab to get your configuration files
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
    <div className="space-y-6">
      {/* Neovim Listener Status */}
      <Alert className={cn(
        "border",
        isNvimConnected 
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
          : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30"
      )}>
        <div className="flex items-center gap-2">
          {isNvimConnected ? (
            <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          )}
          <AlertDescription className={cn(
            isNvimConnected 
              ? "text-green-700 dark:text-green-300"
              : "text-yellow-700 dark:text-yellow-300"
          )}>
            <div className="space-y-2">
              <div className="font-medium">
                {isNvimConnected ? 'Neovim Connected' : 'Neovim Not Connected'}
              </div>
              <div className="text-sm">
                {isNvimConnected 
                  ? 'Ready to save configuration directly to your running Neovim instance'
                  : 'Start Neovim with the listener to enable direct saving'
                }
              </div>
            </div>
          </AlertDescription>
        </div>
      </Alert>

      {/* Save Options */}
      <div className="grid gap-4">
        <div className="flex gap-2">
          <Button 
            onClick={onSaveToNvim}
            disabled={!isNvimConnected}
            className="flex-1 h-14 text-base"
            size="lg"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Configuration to Neovim
          </Button>
          
          <Button
            onClick={onTestConnection}
            variant="outline"
            size="lg"
            className="h-14 px-4"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>

        {hasDirectoryHandle && (
          <Button 
            onClick={onSaveToDirectory}
            variant="outline"
            className="w-full h-14 text-base"
            size="lg"
          >
            <FolderOpen className="w-5 h-5 mr-2" />
            Save to Selected Directory
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-sm text-muted-foreground space-y-2">
        <p>To enable direct saving:</p>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li>Start Neovim in a terminal</li>
          <li>Run <code className="bg-muted px-1 rounded">:lua require('config_listener').start()</code></li>
          <li>The connection indicator above will turn green</li>
        </ol>
      </div>
    </div>
    );
  };

  const renderCopyDownload = () => (
    <div className="space-y-6">
      {/* Configuration Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generated Configuration</h3>
          <Badge variant="secondary">
            {generatedConfig.split('\n').length} lines
          </Badge>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <pre className="text-sm overflow-x-auto bg-muted/50 p-4 rounded-md max-h-96 overflow-y-auto">
              <code>{generatedConfig}</code>
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          onClick={onCopy}
          variant="outline"
          className="h-14 text-base"
          size="lg"
        >
          {copied ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5 mr-2" />
              Copy to Clipboard
            </>
          )}
        </Button>

        <Button 
          onClick={onDownload}
          className="h-14 text-base"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Download init.lua
        </Button>
      </div>

      {/* Manual Instructions */}
      <div className="space-y-4 text-sm text-muted-foreground">
        <div>
          <h4 className="font-medium text-foreground mb-2">Manual Installation:</h4>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Copy the configuration above or download the file</li>
            <li>Navigate to your Neovim config directory:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li><strong>Linux/macOS:</strong> <code className="bg-muted px-1 rounded">~/.config/nvim/</code></li>
                <li><strong>Windows:</strong> <code className="bg-muted px-1 rounded">%LOCALAPPDATA%\nvim\</code></li>
              </ul>
            </li>
            <li>Save the content as <code className="bg-muted px-1 rounded">init.lua</code></li>
            <li>Restart Neovim to apply the configuration</li>
          </ol>
        </div>
      </div>
    </div>
  );

  const renderInstallScripts = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Automated Installation</h3>
        <p className="text-muted-foreground">
          Download platform-specific scripts that install Neovim and configure it automatically
        </p>
      </div>
      
      <InstallerScripts 
        config={config}
        generatedConfig={generatedConfig}
      />
    </div>
  );

  const renderHealthCheck = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Health Check Analysis</h3>
        <p className="text-muted-foreground">
          Paste your Neovim :checkhealth output to analyze potential issues
        </p>
      </div>
      
      <HealthCheckAnalyzer />
    </div>
  );

  const renderImportConfig = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Import Existing Configuration</h3>
        <p className="text-muted-foreground">
          Upload or paste your existing init.lua to import settings
        </p>
      </div>
      
      <ConfigImporter onImportConfig={onImportConfig} />
    </div>
  );

  const renderCurrentCategory = () => {
    switch (selectedCategory) {
      case 'save-nvim':
        return renderSaveToNvim();
      case 'copy-download':
        return renderCopyDownload();
      case 'install-scripts':
        return renderInstallScripts();
      case 'health-check':
        return renderHealthCheck();
      case 'import-config':
        return renderImportConfig();
      default:
        return renderSaveToNvim();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Configuration Ready
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your Neovim configuration has been generated. Choose how you'd like to proceed.
        </p>
      </div>

      {/* Desktop Layout (sidebar) */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {ACTION_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors",
                    selectedCategory === category.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "hover:bg-muted/50"
                  )}
                >
                  {category.icon}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{category.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {category.description}
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Action Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                {ACTION_CATEGORIES.find(cat => cat.id === selectedCategory)?.icon}
                <div>
                  <CardTitle>
                    {ACTION_CATEGORIES.find(cat => cat.id === selectedCategory)?.title}
                  </CardTitle>
                  <CardDescription>
                    {ACTION_CATEGORIES.find(cat => cat.id === selectedCategory)?.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderCurrentCategory()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile/Tablet Layout (tabs) */}
      <div className="lg:hidden">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            {ACTION_CATEGORIES.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex flex-col gap-1 h-16 text-xs"
              >
                {category.icon}
                <span className="hidden sm:inline">{category.title.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {ACTION_CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {category.icon}
                    <div>
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedCategory === category.id && renderCurrentCategory()}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};