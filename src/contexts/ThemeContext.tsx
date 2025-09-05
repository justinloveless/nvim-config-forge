import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeType = 'modern' | 'console' | 'catppuccin' | 'gruvbox' | 'tokyonight' | 'nord' | 'onedark';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  setNvimTheme: (nvimTheme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('modern');

  useEffect(() => {
    // Apply theme class to document root
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    const themes: ThemeType[] = ['modern', 'console', 'catppuccin', 'gruvbox', 'tokyonight', 'nord', 'onedark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const setNvimTheme = (nvimTheme: string) => {
    const themeMap: { [key: string]: ThemeType } = {
      'catppuccin': 'catppuccin',
      'gruvbox': 'gruvbox',
      'tokyonight': 'tokyonight',
      'nord': 'nord',
      'onedark': 'onedark',
      'default': 'modern'
    };
    const mappedTheme = themeMap[nvimTheme] || 'modern';
    setTheme(mappedTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, setNvimTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};