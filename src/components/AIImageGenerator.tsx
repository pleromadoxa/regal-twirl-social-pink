
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { Image, Download, Wand2, Send } from 'lucide-react';

interface AIImageGeneratorProps {
  onGenerationComplete?: () => void;
}

const AIImageGenerator = ({ onGenerationComplete }: AIImageGeneratorProps) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { createPost } = usePosts();

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const enhancedPrompt = `${style} style: ${prompt.trim()}`;
      
      const { data, error } = await supabase.functions.invoke('gemini-image-generator', {
        body: {
          prompt: enhancedPrompt
        }
      });

      if (error) throw error;

      if (data.image) {
        setGeneratedImage(data.image);
        
        // Save to history
        if (user) {
          await supabase.from('ai_generations').insert({
            user_id: user.id,
            prompt: prompt.trim(),
            result: data.image,
            generation_type: 'image'
          });
          
          onGenerationComplete?.();
        }

        toast({
          title: "Image Generated",
          description: "Your image has been generated successfully!"
        });
      } else {
        throw new Error('No image returned from API');
      }

    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostToFeed = async () => {
    if (!generatedImage || !prompt.trim()) return;

    setPosting(true);
    try {
      // Create post with image and caption
      const postContent = `🎨 AI Generated Art: ${prompt}\n\n#AIGenerated #DigitalArt #RegalAI`;
      await createPost(postContent);
      
      toast({
        title: "Posted to Feed",
        description: "Your AI-generated image has been shared to your feed!"
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

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      // Handle base64 images
      if (generatedImage.startsWith('data:image')) {
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Handle URL images
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      toast({
        title: "Downloaded",
        description: "Image downloaded successfully"
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Error",
        description: "Failed to download image",
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
            <Image className="w-5 h-5 text-purple-600" />
            AI Image Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prompt</label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Style</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realistic">Realistic</SelectItem>
                <SelectItem value="artistic">Artistic</SelectItem>
                <SelectItem value="cartoon">Cartoon</SelectItem>
                <SelectItem value="anime">Anime</SelectItem>
                <SelectItem value="abstract">Abstract</SelectItem>
                <SelectItem value="vintage">Vintage</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
                <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                <SelectItem value="photographic">Photographic</SelectItem>
                <SelectItem value="digital art">Digital Art</SelectItem>
              </SelectContent>
            </Select>
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
                Generate Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Generated Image
            {generatedImage && (
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
                <Button variant="outline" size="sm" onClick={downloadImage}>
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedImage ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <img 
                src={generatedImage} 
                alt="Generated image" 
                className="w-full h-auto rounded-lg shadow-lg max-h-96 object-contain mx-auto"
              />
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Your generated image will appear here
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIImageGenerator;
