
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOpenRouterAI } from '@/hooks/useOpenRouterAI';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Wand2, Copy, Send } from 'lucide-react';

interface AIContentGeneratorProps {
  onGenerationComplete?: () => void;
}

const AIContentGenerator = ({ onGenerationComplete }: AIContentGeneratorProps) => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('social-post');
  const [generatedContent, setGeneratedContent] = useState('');
  const [posting, setPosting] = useState(false);
  const { generateText, loading } = useOpenRouterAI();
  const { user } = useAuth();
  const { createPost } = usePosts();
  const { toast } = useToast();

  const contentTypes = {
    'social-post': 'Social Media Post',
    'blog-intro': 'Blog Introduction',
    'product-description': 'Product Description',
    'email-subject': 'Email Subject Line',
    'hashtags': 'Hashtags',
    'caption': 'Image Caption',
    'tweet': 'Tweet',
    'linkedin-post': 'LinkedIn Post'
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const enhancedPrompt = `Create a ${contentTypes[contentType as keyof typeof contentTypes].toLowerCase()} based on this topic: ${prompt}. Make it engaging and appropriate for the platform.`;
    
    const result = await generateText(enhancedPrompt);
    if (result) {
      setGeneratedContent(result);
      
      // Save to history
      if (user) {
        await supabase.from('ai_generations').insert({
          user_id: user.id,
          prompt: prompt.trim(),
          result: result,
          generation_type: 'content'
        });
        
        onGenerationComplete?.();
      }
    }
  };

  const handlePostToFeed = async () => {
    if (!generatedContent.trim()) return;

    setPosting(true);
    try {
      await createPost(generatedContent);
      
      toast({
        title: "Posted to Feed",
        description: "Your AI-generated content has been shared to your feed!"
      });
    } catch (error) {
      console.error('Error posting to feed:', error);
      toast({
        title: "Error",
        description: "Failed to post to feed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPosting(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedContent) return;
    
    try {
      await navigator.clipboard.writeText(generatedContent);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy content",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            AI Content Generator
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
                {Object.entries(contentTypes).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Topic/Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create content about..."
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={loading || !prompt.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePostToFeed}
                  disabled={posting}
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  {posting ? (
                    <>
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1" />
                      Post to Feed
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedContent ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <Textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                className="min-h-[300px] border-0 bg-transparent resize-none focus-visible:ring-0"
                placeholder="Generated content will appear here..."
              />
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Your generated content will appear here
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIContentGenerator;
