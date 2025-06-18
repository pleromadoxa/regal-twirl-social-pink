
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Sparkles, 
  Palette,
  Zap,
  Settings,
  Copy
} from 'lucide-react';

const AIImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('standard');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const { user } = useAuth();
  const { toast } = useToast();

  const styles = [
    { value: 'realistic', label: 'Realistic' },
    { value: 'artistic', label: 'Artistic' },
    { value: 'cartoon', label: 'Cartoon' },
    { value: 'anime', label: 'Anime' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'cyberpunk', label: 'Cyberpunk' }
  ];

  const sizes = [
    { value: '256x256', label: '256×256 (Small)' },
    { value: '512x512', label: '512×512 (Medium)' },
    { value: '1024x1024', label: '1024×1024 (Large)' },
    { value: '1024x1792', label: '1024×1792 (Portrait)' },
    { value: '1792x1024', label: '1792×1024 (Landscape)' }
  ];

  const qualities = [
    { value: 'standard', label: 'Standard' },
    { value: 'hd', label: 'HD (Higher Quality)' }
  ];

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter an image description",
        variant: "destructive"
      });
      return;
    }

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

      setGeneratedImages([data.imageUrl, ...generatedImages.slice(0, 7)]); // Keep last 8 images
      
      // Save to history
      const historyItem = {
        id: Date.now(),
        prompt,
        style,
        size,
        quality,
        imageUrl: data.imageUrl,
        timestamp: new Date()
      };
      
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10 items

      toast({
        title: "Image generated!",
        description: "Your AI-generated image is ready"
      });

    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (imageUrl: string, filename?: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `ai-generated-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded!",
        description: "Image saved to your device"
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download image",
        variant: "destructive"
      });
    }
  };

  const copyPrompt = (promptText: string) => {
    navigator.clipboard.writeText(promptText);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            AI Image Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prompt">Image Description</Label>
            <Input
              id="prompt"
              placeholder="A beautiful sunset over mountains..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="style">Art Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styles.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="size">Image Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quality">Quality</Label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {qualities.map((q) => (
                  <SelectItem key={q.value} value={q.value}>
                    {q.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={generateImage} 
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
                Generate Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Images */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Generated Images</CardTitle>
        </CardHeader>
        <CardContent>
          {generatedImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => downloadImage(imageUrl)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Generated images will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {history.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="relative group">
                    <img
                      src={item.imageUrl}
                      alt="Generated"
                      className="w-full h-32 object-cover rounded-lg cursor-pointer"
                      onClick={() => {
                        setPrompt(item.prompt);
                        setStyle(item.style);
                        setSize(item.size);
                        setQuality(item.quality);
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(item.imageUrl, `${item.prompt.slice(0, 20)}-${item.id}.png`);
                        }}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {item.prompt}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {item.style}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPrompt(item.prompt)}
                        className="h-6 px-2"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
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

export default AIImageGenerator;
