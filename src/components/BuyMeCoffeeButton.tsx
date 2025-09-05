import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export const BuyMeCoffeeButton: React.FC = () => {
  const handleClick = () => {
    window.open('https://buymeacoffee.com/yourusername', '_blank');
  };

  return (
    <Button 
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
    >
      <Heart className="w-4 h-4 text-red-500" />
      Buy me a coffee
    </Button>
  );
};