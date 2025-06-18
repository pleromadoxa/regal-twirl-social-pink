
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
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('standard');
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: {
          prompt: prompt.trim(),
          style,
          size,
          quality,
          userId: user?.id
        }
      });

      if (error) throw error;

      setGeneratedImage(data.imageUrl);
      
      // Save to history
      if (user) {
        await supabase.from('ai_generations').insert({
          user_id: user.id,
          prompt: prompt.trim(),
          result: data.imageUrl,
          generation_type: 'image'
        });
      }

      toast({
        title: "Image Generated",
        description: "Your image has been generated successfully!"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
                  <SelectItem value="1792x1024">Landscape (1792x1024)</SelectItem>
                  <SelectItem value="1024x1792">Portrait (1024x1792)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quality</label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="hd">HD</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
