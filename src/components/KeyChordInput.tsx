import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyChordInputProps {
  value: string;
  onChange: (value: string) => void;
  leaderKey: string;
  placeholder?: string;
  className?: string;
}

const KeyChordInput: React.FC<KeyChordInputProps> = ({
  value,
  onChange,
  leaderKey,
  placeholder = "Press keys...",
  className
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizeKey = (key: string, code: string): string => {
    // Handle special keys
    const specialKeys: { [key: string]: string } = {
      ' ': 'Space',
      'Enter': 'CR',
      'Escape': 'Esc',
      'Backspace': 'BS',
      'Delete': 'Del',
      'Tab': 'Tab',
      'ArrowUp': 'Up',
      'ArrowDown': 'Down',
      'ArrowLeft': 'Left',
      'ArrowRight': 'Right',
      'Home': 'Home',
      'End': 'End',
      'PageUp': 'PageUp',
      'PageDown': 'PageDown',
      'Insert': 'Insert'
    };

    if (specialKeys[key]) {
      return specialKeys[key];
    }

    // Handle function keys
    if (key.startsWith('F') && /^F\d+$/.test(key)) {
      return key;
    }

    // Handle regular keys
    return key.length === 1 ? key : key;
  };

  const formatKeyChord = (keys: string[]): string => {
    if (keys.length === 0) return '';
    
    const modifiers: string[] = [];
    let mainKey = '';
    
    keys.forEach(key => {
      if (key === 'Control') modifiers.push('C');
      else if (key === 'Alt') modifiers.push('A');
      else if (key === 'Shift') modifiers.push('S');
      else if (key === 'Meta') modifiers.push('D'); // Command/Windows key
      else mainKey = key;
    });

    // If the main key is the leader key, replace it with <leader>
    if (mainKey === leaderKey && leaderKey.length === 1) {
      mainKey = '<leader>';
    }

    if (modifiers.length === 0) {
      return mainKey;
    }

    return `<${modifiers.join('-')}-${mainKey}>`;
  };

  const parseKeyChord = (chord: string): string[] => {
    if (!chord) return [];
    
    // Handle <leader> placeholder
    if (chord.includes('<leader>')) {
      return ['<leader>'];
    }

    // Handle special key combinations like <C-s>, <A-f>, etc.
    if (chord.startsWith('<') && chord.endsWith('>')) {
      const inner = chord.slice(1, -1);
      const parts = inner.split('-');
      return parts;
    }

    // Handle simple keys
    return [chord];
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;

    e.preventDefault();
    e.stopPropagation();

    const keys: string[] = [];
    
    if (e.ctrlKey) keys.push('Control');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey && e.key !== 'Shift') keys.push('Shift');
    if (e.metaKey) keys.push('Meta');
    
    const normalizedKey = normalizeKey(e.key, e.code);
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(normalizedKey)) {
      keys.push(normalizedKey);
    }

    if (keys.length > 0 && keys[keys.length - 1] !== '') {
      setRecordedKeys(keys);
      const formatted = formatKeyChord(keys);
      onChange(formatted);
      setIsRecording(false);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedKeys([]);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange('');
    setRecordedKeys([]);
    setIsRecording(false);
  };

  const renderKeyChips = () => {
    const keys = parseKeyChord(value);
    if (keys.length === 0) return null;

    return (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
        {keys.map((key, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="text-xs px-2 py-1 font-mono bg-muted/60 text-foreground border-0"
          >
            {key === '<leader>' ? 'Leader' : key}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={isRecording ? 'Press keys...' : ''}
        onKeyDown={handleKeyDown}
        onFocus={handleStartRecording}
        placeholder={value ? '' : placeholder}
        className={cn(
          "font-mono cursor-pointer",
          value && "pl-20", // Make space for chips
          isRecording && "ring-2 ring-primary/50",
          className
        )}
        readOnly
      />
      
      {renderKeyChips()}
      
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-sm transition-colors"
        >
          <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  );
};

export default KeyChordInput;