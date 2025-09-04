import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ThemeColors {
  background: string;
  foreground: string;
  comment: string;
  keyword: string;
  string: string;
  number: string;
  function: string;
  variable: string;
  operator: string;
  statusBg: string;
  statusFg: string;
  linenumber: string;
}

const themeColors: Record<string, ThemeColors> = {
  catppuccin: {
    background: '#1e1e2e',
    foreground: '#cdd6f4',
    comment: '#6c7086',
    keyword: '#cba6f7',
    string: '#a6e3a1',
    number: '#fab387',
    function: '#89b4fa',
    variable: '#f38ba8',
    operator: '#94e2d5',
    statusBg: '#313244',
    statusFg: '#cdd6f4',
    linenumber: '#585b70'
  },
  gruvbox: {
    background: '#282828',
    foreground: '#ebdbb2',
    comment: '#928374',
    keyword: '#fb4934',
    string: '#b8bb26',
    number: '#d3869b',
    function: '#fabd2f',
    variable: '#83a598',
    operator: '#fe8019',
    statusBg: '#3c3836',
    statusFg: '#ebdbb2',
    linenumber: '#7c6f64'
  },
  tokyonight: {
    background: '#24283b',
    foreground: '#c0caf5',
    comment: '#565f89',
    keyword: '#bb9af7',
    string: '#9ece6a',
    number: '#ff9e64',
    function: '#7aa2f7',
    variable: '#f7768e',
    operator: '#89ddff',
    statusBg: '#1f2335',
    statusFg: '#c0caf5',
    linenumber: '#3b4261'
  },
  nord: {
    background: '#2e3440',
    foreground: '#d8dee9',
    comment: '#616e88',
    keyword: '#81a1c1',
    string: '#a3be8c',
    number: '#b48ead',
    function: '#88c0d0',
    variable: '#bf616a',
    operator: '#5e81ac',
    statusBg: '#3b4252',
    statusFg: '#d8dee9',
    linenumber: '#4c566a'
  },
  onedark: {
    background: '#282c34',
    foreground: '#abb2bf',
    comment: '#5c6370',
    keyword: '#c678dd',
    string: '#98c379',
    number: '#d19a66',
    function: '#61afef',
    variable: '#e06c75',
    operator: '#56b6c2',
    statusBg: '#21252b',
    statusFg: '#abb2bf',
    linenumber: '#4b5263'
  },
  default: {
    background: '#000000',
    foreground: '#ffffff',
    comment: '#0087ff',
    keyword: '#ffff00',
    string: '#ffa0a0',
    number: '#ff40ff',
    function: '#00ff00',
    variable: '#ffffff',
    operator: '#ffffff',
    statusBg: '#444444',
    statusFg: '#ffffff',
    linenumber: '#ffff00'
  }
};

interface ThemePreviewProps {
  themeId: string;
  className?: string;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ themeId, className = '' }) => {
  const colors = themeColors[themeId] || themeColors.default;

  const codeLines = [
    { line: 1, content: [
      { text: 'function', type: 'keyword' },
      { text: ' ', type: 'default' },
      { text: 'hello', type: 'function' },
      { text: '(', type: 'operator' },
      { text: 'name', type: 'variable' },
      { text: ') {', type: 'operator' }
    ]},
    { line: 2, content: [
      { text: '  ', type: 'default' },
      { text: '// Welcome to Neovim!', type: 'comment' }
    ]},
    { line: 3, content: [
      { text: '  ', type: 'default' },
      { text: 'const', type: 'keyword' },
      { text: ' ', type: 'default' },
      { text: 'message', type: 'variable' },
      { text: ' = ', type: 'operator' },
      { text: '"Hello, "', type: 'string' },
      { text: ' + ', type: 'operator' },
      { text: 'name', type: 'variable' },
      { text: ';', type: 'operator' }
    ]},
    { line: 4, content: [
      { text: '  ', type: 'default' },
      { text: 'return', type: 'keyword' },
      { text: ' ', type: 'default' },
      { text: 'message', type: 'variable' },
      { text: '.', type: 'operator' },
      { text: 'repeat', type: 'function' },
      { text: '(', type: 'operator' },
      { text: '3', type: 'number' },
      { text: ');', type: 'operator' }
    ]},
    { line: 5, content: [
      { text: '}', type: 'operator' }
    ]}
  ];

  const getColorForType = (type: string) => {
    switch (type) {
      case 'keyword': return colors.keyword;
      case 'string': return colors.string;
      case 'number': return colors.number;
      case 'function': return colors.function;
      case 'variable': return colors.variable;
      case 'operator': return colors.operator;
      case 'comment': return colors.comment;
      default: return colors.foreground;
    }
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardContent className="p-0">
        <div 
          className="font-mono text-xs leading-relaxed rounded-lg overflow-hidden"
          style={{ backgroundColor: colors.background }}
        >
          {/* Status line */}
          <div 
            className="px-3 py-1 text-xs font-semibold border-b"
            style={{ 
              backgroundColor: colors.statusBg, 
              color: colors.statusFg,
              borderColor: colors.linenumber 
            }}
          >
            init.lua [+] • Normal
          </div>
          
          {/* Code content */}
          <div className="p-3">
            {codeLines.map((line, idx) => (
              <div key={idx} className="flex items-start">
                <span 
                  className="w-6 text-right mr-3 select-none"
                  style={{ color: colors.linenumber }}
                >
                  {line.line}
                </span>
                <div className="flex-1">
                  {line.content.map((token, tokenIdx) => (
                    <span
                      key={tokenIdx}
                      style={{ color: getColorForType(token.type) }}
                    >
                      {token.text}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};