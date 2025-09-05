import React from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Terminal, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const getThemeInfo = () => {
    switch (theme) {
      case 'modern':
        return { icon: Monitor, label: 'Modern', color: '' };
      case 'console':
        return { icon: Terminal, label: 'Console', color: 'border-console-green text-console-green hover:bg-console-green hover:text-black' };
      case 'catppuccin':
        return { icon: Palette, label: 'Catppuccin', color: 'border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black' };
      case 'gruvbox':
        return { icon: Palette, label: 'Gruvbox', color: 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' };
      case 'tokyonight':
        return { icon: Palette, label: 'Tokyo Night', color: 'border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black' };
      case 'nord':
        return { icon: Palette, label: 'Nord', color: 'border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black' };
      case 'onedark':
        return { icon: Palette, label: 'One Dark', color: 'border-green-400 text-green-400 hover:bg-green-400 hover:text-black' };
      default:
        return { icon: Monitor, label: 'Modern', color: '' };
    }
  };

  const themeInfo = getThemeInfo();
  const Icon = themeInfo.icon;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        "flex items-center gap-2",
        themeInfo.color
      )}
    >
      <Icon className="w-4 h-4" />
      {themeInfo.label}
    </Button>
  );
};