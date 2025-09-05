import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Copy, Check, Terminal, Apple, Monitor } from 'lucide-react';
import { NvimConfig } from './PresetStacks';

interface InstallerScriptsProps {
  config: NvimConfig;
  generatedConfig: string;
}

export const InstallerScripts: React.FC<InstallerScriptsProps> = ({ config, generatedConfig }) => {
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const generateMacOSScript = () => {
    const toolCommands = config.languages.map(lang => {
      switch (lang) {
        case 'typescript':
        case 'javascript':
          return 'npm install -g typescript @vscode/vscode-json-languageserver';
        case 'python':
          return 'pip install pylsp black isort';
        case 'rust':
          return 'rustup component add rust-analyzer';
        case 'go':
          return 'go install golang.org/x/tools/gopls@latest';
        case 'c':
        case 'cpp':
          return 'brew install clang-format';
        case 'csharp':
          return 'dotnet tool install --global csharp-ls';
        case 'java':
          return 'brew install jdtls';
        case 'lua':
          return 'brew install lua-language-server';
        default:
          return '';
      }
    }).filter(Boolean);

    return `#!/bin/bash
set -e

echo "🚀 Installing Neovim Configuration..."

# Check if Neovim is installed
if ! command -v nvim &> /dev/null; then
    echo "Installing Neovim..."
    brew install neovim
fi

# Install JetBrains Mono Nerd Font
echo "Installing JetBrains Mono Nerd Font..."
brew install font-jetbrains-mono-nerd-font

# Create config directory
mkdir -p ~/.config/nvim

# Backup existing config if it exists
if [ -f ~/.config/nvim/init.lua ]; then
    echo "Backing up existing config..."
    mv ~/.config/nvim/init.lua ~/.config/nvim/init.lua.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create the init.lua file
cat > ~/.config/nvim/init.lua << 'EOF'
${generatedConfig}
EOF

# Install language tools
echo "Installing language tools..."
${toolCommands.join('\n')}

echo "✅ Neovim configuration installed successfully!"
echo "📝 Don't forget to set your terminal to use 'JetBrains Mono Nerd Font'"
echo "Run 'nvim' to start using your new configuration."
`;
  };

  const generateLinuxScript = () => {
    const toolCommands = config.languages.map(lang => {
      switch (lang) {
        case 'typescript':
        case 'javascript':
          return 'npm install -g typescript @vscode/vscode-json-languageserver';
        case 'python':
          return 'pip install pylsp black isort';
        case 'rust':
          return 'rustup component add rust-analyzer';
        case 'go':
          return 'go install golang.org/x/tools/gopls@latest';
        case 'c':
        case 'cpp':
          return 'sudo apt-get install clang-format || sudo dnf install clang-tools-extra || sudo pacman -S clang';
        case 'csharp':
          return 'dotnet tool install --global csharp-ls';
        case 'java':
          return 'sudo apt-get install openjdk-17-jdk || sudo dnf install java-17-openjdk-devel';
        case 'lua':
          return 'sudo apt-get install lua-language-server || sudo dnf install lua-language-server || sudo pacman -S lua-language-server';
        default:
          return '';
      }
    }).filter(Boolean);

    return `#!/bin/bash
set -e

echo "🚀 Installing Neovim Configuration..."

# Check if Neovim is installed
if ! command -v nvim &> /dev/null; then
    echo "Installing Neovim..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install neovim
    elif command -v dnf &> /dev/null; then
        sudo dnf install neovim
    elif command -v pacman &> /dev/null; then
        sudo pacman -S neovim
    else
        echo "Please install Neovim manually from https://neovim.io/"
        exit 1
    fi
fi

# Install JetBrains Mono Nerd Font
echo "Installing JetBrains Mono Nerd Font..."
FONT_DIR="$HOME/.local/share/fonts"
mkdir -p "$FONT_DIR"
cd "$FONT_DIR"
curl -fLo "JetBrains Mono Nerd Font Complete.ttf" \\
    https://github.com/ryanoasis/nerd-fonts/raw/HEAD/patched-fonts/JetBrainsMono/Ligatures/Regular/JetBrainsMonoNerdFont-Regular.ttf
fc-cache -fv

# Create config directory
mkdir -p ~/.config/nvim

# Backup existing config if it exists
if [ -f ~/.config/nvim/init.lua ]; then
    echo "Backing up existing config..."
    mv ~/.config/nvim/init.lua ~/.config/nvim/init.lua.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create the init.lua file
cat > ~/.config/nvim/init.lua << 'EOF'
${generatedConfig}
EOF

# Install language tools
echo "Installing language tools..."
${toolCommands.join('\n')}

echo "✅ Neovim configuration installed successfully!"
echo "📝 Don't forget to set your terminal to use 'JetBrains Mono Nerd Font'"
echo "Run 'nvim' to start using your new configuration."
`;
  };

  const generateWindowsScript = () => {
    const toolCommands = config.languages.map(lang => {
      switch (lang) {
        case 'typescript':
        case 'javascript':
          return 'npm install -g typescript typescript-language-server vscode-langservers-extracted';
        case 'json':
        case 'html':
        case 'css':
          return 'npm install -g vscode-langservers-extracted';
        case 'yaml':
          return 'npm install -g yaml-language-server';
        case 'markdown':
          return 'npm install -g markdown-language-server';
        case 'sql':
          return 'npm install -g sql-language-server';
        case 'dockerfile':
          return 'npm install -g dockerfile-language-server-nodejs';
        case 'bash':
          return 'npm install -g bash-language-server';
        case 'python':
          return 'pip install pylsp black isort';
        case 'rust':
          return 'rustup component add rust-analyzer';
        case 'go':
          return 'go install golang.org/x/tools/gopls@latest';
        case 'c':
        case 'cpp':
          return 'winget install LLVM.LLVM';
        case 'csharp':
          return 'Push-Location $env:TEMP; dotnet tool install --global csharp-ls; Pop-Location';
        case 'java':
          return 'winget install Microsoft.OpenJDK.17';
        case 'lua':
          return 'winget install Lua.LuaLanguageServer';
        default:
          return '';
      }
    }).filter(Boolean);

    return `# PowerShell Installation Script for Neovim Configuration
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

Write-Host "Installing Neovim Configuration..." -ForegroundColor Cyan

# Check if Neovim is installed
if (!(Get-Command nvim -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Neovim..." -ForegroundColor Yellow
    winget install Neovim.Neovim
}

# Install JetBrains Mono Nerd Font
Write-Host "Installing JetBrains Mono Nerd Font..." -ForegroundColor Yellow
winget install JetBrains.JetBrainsMono

# Create config directory
$configDir = "$env:LOCALAPPDATA\\nvim"
if (!(Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# Backup existing config if it exists
$initFile = "$configDir\\init.lua"
if (Test-Path $initFile) {
    Write-Host "Backing up existing config..." -ForegroundColor Yellow
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Move-Item $initFile "$initFile.backup.$timestamp"
}

# Create the init.lua file
$configContent = @'
${generatedConfig}
'@

Set-Content -Path $initFile -Value $configContent -Encoding UTF8

# Install language tools
Write-Host "Installing language tools..." -ForegroundColor Yellow
${toolCommands.join('\n')}

Write-Host "Neovim configuration installed successfully!" -ForegroundColor Green
Write-Host "Do not forget to set your terminal to use JetBrains Mono Nerd Font" -ForegroundColor Yellow
Write-Host "Run nvim to start using your new configuration." -ForegroundColor Cyan
Read-Host "Press Enter to continue..."
`;
  };

  const scripts = {
    macos: { name: 'install-neovim-config.sh', content: generateMacOSScript() },
    linux: { name: 'install-neovim-config.sh', content: generateLinuxScript() },
    windows: { name: 'install-neovim-config.ps1', content: generateWindowsScript() }
  };

  const handleCopyScript = async (os: string) => {
    try {
      await navigator.clipboard.writeText(scripts[os as keyof typeof scripts].content);
      setCopiedScript(os);
      setTimeout(() => setCopiedScript(null), 2000);
    } catch (err) {
      console.error('Failed to copy script:', err);
    }
  };

  const handleDownloadScript = (os: string) => {
    const script = scripts[os as keyof typeof scripts];
    const blob = new Blob([script.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = script.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">One-Click Installation Scripts</h3>
        <p className="text-muted-foreground">
          Download and run these scripts to automatically install Neovim, your configuration, and all required language tools.
        </p>
      </div>

      <Tabs defaultValue="macos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="macos" className="flex items-center gap-2">
            <Apple className="w-4 h-4" />
            macOS
          </TabsTrigger>
          <TabsTrigger value="linux" className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Linux
          </TabsTrigger>
          <TabsTrigger value="windows" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Windows
          </TabsTrigger>
        </TabsList>

        {Object.entries(scripts).map(([os, script]) => (
          <TabsContent key={os} value={os} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Terminal className="w-5 h-5" />
                  {script.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  This script will install Neovim, create your configuration, and set up all language tools.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownloadScript(os)}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Script
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCopyScript(os)}
                    className="flex items-center gap-2"
                  >
                    {copiedScript === os ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Script
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="bg-background/50 rounded-md p-4 font-mono text-sm max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{script.content}</pre>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold mb-2">How to run:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {os === 'windows' ? (
                      <>
                        <li>Download the .ps1 file</li>
                        <li>Right-click and "Run with PowerShell" or open PowerShell and run: <code className="bg-background/50 px-1 rounded">powershell -ExecutionPolicy Bypass -File {script.name}</code></li>
                        <li>Follow the prompts</li>
                      </>
                    ) : (
                      <>
                        <li>Download the .sh file</li>
                        <li>Make it executable: <code className="bg-background/50 px-1 rounded">chmod +x {script.name}</code></li>
                        <li>Run it: <code className="bg-background/50 px-1 rounded">./{script.name}</code></li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};