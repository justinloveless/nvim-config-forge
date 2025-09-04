import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Lightbulb, Copy, ClipboardPaste } from 'lucide-react';

interface HealthIssue {
  type: 'error' | 'warning' | 'ok';
  category: string;
  message: string;
  suggestion?: string;
}

export const HealthCheckAnalyzer: React.FC = () => {
  const [healthOutput, setHealthOutput] = useState('');
  const [analyzedIssues, setAnalyzedIssues] = useState<HealthIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const parseHealthCheck = (output: string): HealthIssue[] => {
    const lines = output.split('\n');
    const issues: HealthIssue[] = [];
    let currentCategory = 'General';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Detect category headers
      if (trimmedLine.includes('health#') || trimmedLine.includes('##')) {
        currentCategory = trimmedLine.replace(/.*health#|##|\s*$/g, '').trim() || 'General';
        continue;
      }

      // Parse error patterns
      if (trimmedLine.includes('ERROR') || trimmedLine.includes('✗')) {
        let suggestion = '';
        const errorText = trimmedLine.replace(/ERROR:|✗/, '').trim();
        
        // Common error suggestions
        if (errorText.includes('executable not found') || errorText.includes('not installed')) {
          const tool = errorText.match(/`([^`]+)`/)?.[1] || 'tool';
          suggestion = `Install ${tool} using your package manager or download from the official website.`;
        } else if (errorText.includes('python') && errorText.includes('provider')) {
          suggestion = 'Install the pynvim package: pip install pynvim';
        } else if (errorText.includes('ruby') && errorText.includes('provider')) {
          suggestion = 'Install the neovim gem: gem install neovim';
        } else if (errorText.includes('node') && errorText.includes('provider')) {
          suggestion = 'Install the neovim npm package: npm install -g neovim';
        } else if (errorText.includes('clipboard')) {
          suggestion = 'Install a clipboard tool like xclip (Linux) or pbcopy (macOS)';
        }

        issues.push({
          type: 'error',
          category: currentCategory,
          message: errorText,
          suggestion
        });
      }
      
      // Parse warning patterns
      else if (trimmedLine.includes('WARNING') || trimmedLine.includes('⚠')) {
        const warningText = trimmedLine.replace(/WARNING:|⚠/, '').trim();
        let suggestion = '';
        
        if (warningText.includes('version')) {
          suggestion = 'Consider updating to the latest version for better compatibility.';
        } else if (warningText.includes('config') || warningText.includes('configuration')) {
          suggestion = 'Review your configuration file for any deprecated or incorrect settings.';
        }

        issues.push({
          type: 'warning',
          category: currentCategory,
          message: warningText,
          suggestion
        });
      }
      
      // Parse OK patterns
      else if (trimmedLine.includes('OK') || trimmedLine.includes('✓')) {
        const okText = trimmedLine.replace(/OK:|✓/, '').trim();
        if (okText) {
          issues.push({
            type: 'ok',
            category: currentCategory,
            message: okText
          });
        }
      }
    }

    return issues;
  };

  const handleAnalyze = () => {
    if (!healthOutput.trim()) return;
    
    setIsAnalyzing(true);
    setTimeout(() => {
      const issues = parseHealthCheck(healthOutput);
      setAnalyzedIssues(issues);
      setIsAnalyzing(false);
    }, 500);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setHealthOutput(text);
    } catch (err) {
      console.error('Failed to paste from clipboard:', err);
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'ok':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getIssueVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'ok':
        return 'default';
      default:
        return 'outline';
    }
  };

  const errorCount = analyzedIssues.filter(i => i.type === 'error').length;
  const warningCount = analyzedIssues.filter(i => i.type === 'warning').length;
  const okCount = analyzedIssues.filter(i => i.type === 'ok').length;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">Health Check Analyzer</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Paste the output from <code className="bg-background/50 px-2 py-1 rounded">:checkhealth</code> to get personalized suggestions for fixing issues.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Neovim Health Check Output
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Run <code className="bg-background/50 px-2 py-1 rounded">:checkhealth</code> in Neovim and paste the output here.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Paste your :checkhealth output here..."
              value={healthOutput}
              onChange={(e) => setHealthOutput(e.target.value)}
              className="min-h-32 font-mono text-sm"
            />
            <Button
              onClick={handlePasteFromClipboard}
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
            >
              <ClipboardPaste className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleAnalyze}
              disabled={!healthOutput.trim() || isAnalyzing}
              className="flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Health Check'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setHealthOutput('');
                setAnalyzedIssues([]);
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {analyzedIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <div className="flex gap-4 text-sm">
              {errorCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errorCount} Error{errorCount !== 1 ? 's' : ''}
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {warningCount} Warning{warningCount !== 1 ? 's' : ''}
                </Badge>
              )}
              {okCount > 0 && (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {okCount} OK
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(
                analyzedIssues.reduce((acc, issue) => {
                  if (!acc[issue.category]) acc[issue.category] = [];
                  acc[issue.category].push(issue);
                  return acc;
                }, {} as Record<string, HealthIssue[]>)
              ).map(([category, issues]) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-semibold text-lg text-foreground">{category}</h4>
                  <div className="space-y-2">
                    {issues.map((issue, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border"
                      >
                        {getIssueIcon(issue.type)}
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-foreground">{issue.message}</p>
                          {issue.suggestion && (
                            <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded">
                              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-blue-700 dark:text-blue-300">{issue.suggestion}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};