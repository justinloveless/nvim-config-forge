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
  const [keySequence, setKeySequence] = useState<string[]>([]);
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

  const formatKeySequence = (sequence: string[]): string => {
    if (sequence.length === 0) return '';
    
    // Handle sequences like ['<leader>', 's'] or ['<C-s>']
    return sequence.join('');
  };

  const formatSingleKey = (keys: string[]): string => {
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

    // Check if this key is the leader key (handle both normalized and raw forms)
    const isLeaderKey = mainKey === leaderKey || 
                       (mainKey === 'Space' && leaderKey === ' ');

    if (isLeaderKey) {
      return '<leader>';
    }

    if (modifiers.length === 0) {
      return mainKey;
    }

    return `<${modifiers.join('-')}-${mainKey}>`;
  };

  const parseKeyChord = (chord: string): string[] => {
    if (!chord) return [];
    
    // Parse complex sequences like "<leader>s" or "<C-s>"
    const tokens: string[] = [];
    let i = 0;
    
    while (i < chord.length) {
      if (chord[i] === '<') {
        // Find the closing >
        const closeIndex = chord.indexOf('>', i);
        if (closeIndex !== -1) {
          tokens.push(chord.substring(i, closeIndex + 1));
          i = closeIndex + 1;
        } else {
          // Malformed, just add the character
          tokens.push(chord[i]);
          i++;
        }
      } else {
        tokens.push(chord[i]);
        i++;
      }
    }
    
    return tokens;
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
    
    // When modifiers are pressed, use e.code to get the physical key
    // as e.key might be a control character
    let keyToUse = e.key;
    if ((e.ctrlKey || e.altKey || e.metaKey) && e.code.startsWith('Key')) {
      // Extract letter from KeyX format (e.g., 'KeyX' -> 'X')
      keyToUse = e.code.slice(3);
    } else if ((e.ctrlKey || e.altKey || e.metaKey) && e.code.startsWith('Digit')) {
      // Extract digit from DigitX format (e.g., 'Digit1' -> '1')
      keyToUse = e.code.slice(5);
    }
    
    const normalizedKey = normalizeKey(keyToUse, e.code);
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(normalizedKey)) {
      keys.push(normalizedKey);
    }

    if (keys.length > 0 && keys[keys.length - 1] !== '') {
      const formattedKey = formatSingleKey(keys);
      
      // If this is the first key and it's the leader key, continue recording
      if (keySequence.length === 0 && formattedKey === '<leader>') {
        setKeySequence([formattedKey]);
        setRecordedKeys([]);
        return; // Continue recording
      }
      
      // If we already have keys in sequence, add this one and finish
      if (keySequence.length > 0) {
        const fullSequence = [...keySequence, formattedKey];
        const final = formatKeySequence(fullSequence);
        onChange(final);
        setKeySequence([]);
        setRecordedKeys([]);
        setIsRecording(false);
        return;
      }
      
      // Single key (not leader-based)
      onChange(formattedKey);
      setRecordedKeys([]);
      setKeySequence([]);
      setIsRecording(false);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedKeys([]);
    setKeySequence([]);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange('');
    setRecordedKeys([]);
    setKeySequence([]);
    setIsRecording(false);
  };

  const renderKeyChips = () => {
    // Show current sequence being recorded or the final value
    const displaySequence = isRecording && keySequence.length > 0 ? keySequence : parseKeyChord(value);
    if (displaySequence.length === 0) return null;

    return (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
        {displaySequence.map((key, index) => (
          <Badge
            key={index}
            variant="secondary"
            className={cn(
              "text-xs px-2 py-1 font-mono bg-muted/60 text-foreground border-0",
              isRecording && "ring-1 ring-primary/50"
            )}
          >
            {key === '<leader>' ? 'Leader' : key.replace(/[<>]/g, '')}
          </Badge>
        ))}
        {isRecording && keySequence.length > 0 && (
          <Badge
            variant="outline"
            className="text-xs px-2 py-1 font-mono animate-pulse border-primary/50"
          >
            ...
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={isRecording ? (keySequence.length > 0 ? 'Continue typing...' : 'Press keys...') : ''}
        onKeyDown={handleKeyDown}
        onFocus={handleStartRecording}
        placeholder={value ? '' : placeholder}
        className={cn(
          "font-mono cursor-pointer",
          (value || (isRecording && keySequence.length > 0)) && "pl-20", // Make space for chips
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