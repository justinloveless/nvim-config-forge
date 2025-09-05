import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeType = 'modern' | 'console';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
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
    document.documentElement.className = theme === 'console' ? 'console-theme' : '';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'modern' ? 'console' : 'modern');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};