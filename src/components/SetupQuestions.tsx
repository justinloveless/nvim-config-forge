import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Monitor, 
  Download, 
  Package,
  CheckCircle,
  HelpCircle,
  FileUp,
  ArrowRight
} from 'lucide-react';
import { ConfigImporter } from './ConfigImporter';

interface SetupQuestionsProps {
  onSetupChoice: (setupType: 'fresh' | 'existing-no-listener' | 'existing-with-listener', hasConfigListener: boolean) => void;
  onImportConfig: (config: any) => void;
}

export const SetupQuestions: React.FC<SetupQuestionsProps> = ({ 
  onSetupChoice, 
  onImportConfig 
}) => {
  const [showImporter, setShowImporter] = React.useState(false);

  const setupOptions = [
    {
      id: 'fresh',
      type: 'fresh' as const,
      title: 'Fresh Install',
      description: 'I\'m installing Neovim for the first time or want a clean setup',
      icon: <Package className="w-6 h-6" />,
      color: 'text-green-500',
      badge: 'Recommended for beginners',
      badgeColor: 'bg-green-100 text-green-700',
      features: ['Installation scripts', 'Complete setup guide', 'All dependencies included'],
      hasConfigListener: false
    },
    {
      id: 'existing-no-listener',
      type: 'existing-no-listener' as const,
      title: 'Existing Install',
      description: 'I have Neovim installed but haven\'t used this config app before',
      icon: <Download className="w-6 h-6" />,
      color: 'text-blue-500',
      badge: 'Manual setup required',
      badgeColor: 'bg-blue-100 text-blue-700',
      features: ['Copy/download configuration', 'Manual installation steps', 'Existing setup preserved'],
      hasConfigListener: false
    },
    {
      id: 'existing-with-listener',
      type: 'existing-with-listener' as const,
      title: 'With Config Listener',
      description: 'I have the config listener plugin installed and running',
      icon: <Monitor className="w-6 h-6" />,
      color: 'text-purple-500',
      badge: 'Direct save enabled',
      badgeColor: 'bg-purple-100 text-purple-700',
      features: ['Direct save to Neovim', 'Live configuration updates', 'Instant preview'],
      hasConfigListener: true
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Let's Get Started
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tell us about your Neovim setup so we can provide the best experience for you.
        </p>
      </div>

      {/* Import Option */}
      <div className="text-center">
        <Button
          onClick={() => setShowImporter(!showImporter)}
          variant="outline"
          className="flex items-center gap-2 mx-auto"
        >
          <FileUp className="w-4 h-4" />
          {showImporter ? 'Hide Import Options' : 'Import Existing Configuration'}
        </Button>
        
        {showImporter && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-center">
                <FileUp className="w-5 h-5" />
                Import Your Existing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConfigImporter onImportConfig={onImportConfig} />
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Setup Options */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-center">
          Choose Your Setup Type
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {setupOptions.map((option) => (
            <Card 
              key={option.id} 
              className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary/30"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`${option.color}`}>
                    {option.icon}
                  </div>
                  <Badge className={option.badgeColor}>
                    {option.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{option.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="text-xs font-medium text-muted-foreground">
                    What you'll get:
                  </div>
                  <ul className="space-y-2">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  onClick={() => onSetupChoice(option.type, option.hasConfigListener)}
                  className="w-full group-hover:bg-primary/90"
                >
                  Choose This Setup
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="text-center">
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Not sure which to choose?</span>
            </div>
            <p className="text-sm text-muted-foreground">
              If you're new to Neovim or want a complete setup, go with <strong>Fresh Install</strong>. 
              If you already have Neovim configured, choose <strong>Existing Install</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};