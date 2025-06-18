
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Wand2, 
  Copy, 
  Download, 
  Share2, 
  RefreshCw,
  Sparkles,
  FileText,
  Hash,
  MessageSquare,
  Globe,
  Image,
  Video
} from 'lucide-react';

const AIContentGenerator = () => {
  const [contentType, setContentType] = useState('social-post');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [audience, setAudience] = useState('general');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const { user } = useAuth();
  const { toast } = useToast();

  const contentTypes = [
    { value: 'social-post', label: 'Social Media Post', icon: MessageSquare },
    { value: 'blog-post', label: 'Blog Post', icon: FileText },
    { value: 'email', label: 'Email', icon: MessageSquare },
    { value: 'product-description', label: 'Product Description', icon: FileText },
    { value: 'hashtags', label: 'Hashtags', icon: Hash },
    { value: 'website-copy', label: 'Website Copy', icon: Globe },
    { value: 'ad-copy', label: 'Advertisement Copy', icon: Sparkles },
    { value: 'video-script', label: 'Video Script', icon: Video }
  ];

  const tones = [
    'professional', 'casual', 'friendly', 'formal', 'humorous', 
    'inspiring', 'persuasive', 'informative', 'creative', 'urgent'
  ];

  const lengths = [
    { value: 'short', label: 'Short (50-100 words)' },
    { value: 'medium', label: 'Medium (100-300 words)' },
    { value: 'long', label: 'Long (300-500 words)' },
    { value: 'very-long', label: 'Very Long (500+ words)' }
  ];

  const audiences = [
    'general', 'business-professionals', 'millennials', 'gen-z', 
    'parents', 'students', 'entrepreneurs', 'tech-enthusiasts', 'creatives'
  ];

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a content prompt",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          contentType,
          prompt: prompt.trim(),
          tone,
          length,
          audience,
          userId: user?.id
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      
      // Save to history
      const historyItem = {
        id: Date.now(),
        contentType,
        prompt,
        content: data.content,
        tone,
        length,
        audience,
        timestamp: new Date()
      };
      
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10 items

      toast({
        title: "Content generated!",
        description: "Your AI-generated content is ready"
      });

    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard"
    });
  };

  const downloadContent = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-generated-${contentType}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Content saved to your device"
    });
  };

  const shareContent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Content',
          text: generatedContent,
        });
      } catch (error) {
        copyContent(); // Fallback to copy
      }
    } else {
      copyContent(); // Fallback to copy
    }
  };

  const loadFromHistory = (item: any) => {
    setContentType(item.contentType);
    setPrompt(item.prompt);
    setTone(item.tone);
    setLength(item.length);
    setAudience(item.audience);
    setGeneratedContent(item.content);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            AI Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="content-type">Content Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="prompt">Content Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe what content you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="length">Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lengths.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="audience">Target Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {audiences.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={generateContent} 
            disabled={loading || !prompt.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Content
              {generatedContent && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyContent}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadContent}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareContent}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{contentType}</Badge>
                  <Badge variant="outline">{tone}</Badge>
                  <Badge variant="outline">{length}</Badge>
                  <Badge variant="outline">{audience}</Badge>
                </div>
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  rows={10}
                  className="min-h-[200px]"
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Generated content will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Generations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => loadFromHistory(item)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{item.contentType}</Badge>
                      <span className="text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {item.prompt}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIContentGenerator;
