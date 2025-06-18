
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Image, Download, Wand2 } from 'lucide-react';

const AIImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const enhancedPrompt = `${style} style: ${prompt.trim()}`;
      
      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: {
          prompt: enhancedPrompt,
          type: 'image'
        }
      });

      if (error) throw error;

      // For now, we'll generate a placeholder since OpenRouter doesn't do images
      // You could integrate with DALL-E or another image service here
      const placeholderImage = `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent(prompt.slice(0, 20))}`;
      setGeneratedImage(placeholderImage);
      
      // Save to history
      if (user) {
        await supabase.from('ai_generations').insert({
          user_id: user.id,
          prompt: prompt.trim(),
          result: placeholderImage,
          generation_type: 'image'
        });
      }

      toast({
        title: "Image Generated",
        description: "Your image placeholder has been generated!"
      });

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

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
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
            Image Generator
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
              <Button variant="outline" size="sm" onClick={downloadImage}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedImage ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <img 
                src={generatedImage} 
                alt="Generated image" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Your generated image will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIImageGenerator;
