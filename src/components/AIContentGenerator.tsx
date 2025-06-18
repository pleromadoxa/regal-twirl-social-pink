
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Copy, Download, Wand2 } from 'lucide-react';

const AIContentGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('social-post');
  const [tone, setTone] = useState('friendly');
  const [length, setLength] = useState('medium');
  const [audience, setAudience] = useState('general');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          prompt: prompt.trim(),
          contentType,
          tone,
          length,
          audience,
          userId: user?.id
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      
      // Save to history
      if (user) {
        await supabase.from('ai_generations').insert({
          user_id: user.id,
          prompt: prompt.trim(),
          result: data.content,
          generation_type: 'content'
        });
      }

      toast({
        title: "Content Generated",
        description: "Your content has been generated successfully!"
      });

    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied",
      description: "Content copied to clipboard"
    });
  };

  const downloadContent = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `generated-content-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Content Type</label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="social-post">Social Media Post</SelectItem>
                <SelectItem value="blog-post">Blog Post</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="product-description">Product Description</SelectItem>
                <SelectItem value="hashtags">Hashtags</SelectItem>
                <SelectItem value="website-copy">Website Copy</SelectItem>
                <SelectItem value="ad-copy">Ad Copy</SelectItem>
                <SelectItem value="video-script">Video Script</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tone</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Length</label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="very-long">Very Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Audience</label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Audience</SelectItem>
                <SelectItem value="business-professionals">Business Professionals</SelectItem>
                <SelectItem value="young-adults">Young Adults</SelectItem>
                <SelectItem value="entrepreneurs">Entrepreneurs</SelectItem>
                <SelectItem value="creatives">Creatives</SelectItem>
                <SelectItem value="tech-enthusiasts">Tech Enthusiasts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create..."
              rows={4}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={loading || !prompt.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Generated Content
            {generatedContent && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={downloadContent}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedContent ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[400px]">
              <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Your generated content will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIContentGenerator;
