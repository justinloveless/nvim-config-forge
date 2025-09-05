import React from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Terminal } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        "flex items-center gap-2",
        theme === 'console' && "border-console-green text-console-green hover:bg-console-green hover:text-black"
      )}
    >
      {theme === 'modern' ? (
        <>
          <Monitor className="w-4 h-4" />
          Modern
        </>
      ) : (
        <>
          <Terminal className="w-4 h-4" />
          Console
        </>
      )}
    </Button>
  );
};