import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import SidebarNav from '@/components/SidebarNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Wand2, 
  FileText, 
  Image, 
  MessageSquare,
  Building2,
  Crown,
  Download,
  Send,
  Copy,
  RefreshCw,
  TrendingUp,
  Zap,
  Brain
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOpenRouterAI } from '@/hooks/useOpenRouterAI';
import { useAI } from '@/hooks/useAI';
import AIImageGenerator from '@/components/AIImageGenerator';
import AIContentGenerator from '@/components/AIContentGenerator';

const AIStudio = () => {
  const { user } = useAuth();
  const { myPages } = useBusinessPages();
  const { toast } = useToast();
  const { generateText, enhanceText, generateResearch, loading: openRouterLoading } = useOpenRouterAI();
  const { generateCaption, enhanceContent, generateHashtags, translateContent, summarizeContent, loading: aiLoading } = useAI();
  
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [generationType, setGenerationType] = useState<string>('content');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [generations, setGenerations] = useState<any[]>([]);
  const [textPrompt, setTextPrompt] = useState('');
  const [textResult, setTextResult] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('realistic');
  const [generatedImage, setGeneratedImage] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [generationStats, setGenerationStats] = useState({
    total: 0,
    content: 0,
    text: 0,
    image: 0,
    today: 0
  });
  const [researchPrompt, setResearchPrompt] = useState('');
  const [researchResult, setResearchResult] = useState('');
  const [selectedResearchModel, setSelectedResearchModel] = useState('tngtech/deepseek-r1t-chimera:free');
  const [editingGeneration, setEditingGeneration] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    if (myPages.length > 0 && !selectedPage) {
      setSelectedPage(myPages[0].id);
    }
  }, [myPages, selectedPage]);

  useEffect(() => {
    fetchGenerations();
    fetchGenerationStats();
  }, [user]);

  const fetchGenerations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setGenerations(data || []);
    } catch (error) {
      console.error('Error fetching generations:', error);
    }
  };

  const fetchGenerationStats = async () => {
    if (!user) return;

    try {
      // Get total generations
      const { data: totalData, error: totalError } = await supabase
        .from('ai_generations')
        .select('id, generation_type, created_at')
        .eq('user_id', user.id);

      if (totalError) throw totalError;

      const total = totalData?.length || 0;
      const content = totalData?.filter(g => g.generation_type === 'content').length || 0;
      const text = totalData?.filter(g => g.generation_type === 'text').length || 0;
      const image = totalData?.filter(g => g.generation_type === 'image').length || 0;
      
      // Get today's generations
      const today = new Date().toISOString().split('T')[0];
      const todayCount = totalData?.filter(g => 
        g.created_at && g.created_at.split('T')[0] === today
      ).length || 0;

      setGenerationStats({
        total,
        content,
        text,
        image,
        today: todayCount
      });
    } catch (error) {
      console.error('Error fetching generation stats:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive"
      });
      return;
    }

    let resultText = '';
    
    try {
      switch (generationType) {
        case 'content':
          resultText = await generateCaption(prompt) || '';
          break;
        case 'marketing':
          resultText = await enhanceContent(prompt) || '';
          break;
        case 'hashtags':
          resultText = await generateHashtags(prompt) || '';
          break;
        case 'translation':
          resultText = await translateContent(prompt, 'English') || '';
          break;
        case 'summary':
          resultText = await summarizeContent(prompt) || '';
          break;
        default:
          resultText = await generateCaption(prompt) || '';
      }

      setResult(resultText);
      fetchGenerations();
      fetchGenerationStats();
      
      toast({
        title: "Success",
        description: "AI content generated successfully"
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive"
      });
    }
  };

  const handleTextGeneration = async () => {
    if (!textPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a text prompt",
        variant: "destructive"
      });
      return;
    }

    try {
      const generated = await generateText(textPrompt, 'text');
      if (generated) {
        setTextResult(generated);
        fetchGenerationStats();
        toast({
          title: "Success",
          description: "Text generated successfully"
        });
      }
    } catch (error) {
      console.error('Error generating text:', error);
      toast({
        title: "Error",
        description: "Failed to generate text",
        variant: "destructive"
      });
    }
  };

  const handleTextEnhancement = async () => {
    if (!textResult.trim()) {
      toast({
        title: "Error",
        description: "Please generate text first to enhance",
        variant: "destructive"
      });
      return;
    }

    try {
      const enhanced = await enhanceText(textResult);
      if (enhanced) {
        setTextResult(enhanced);
        toast({
          title: "Success",
          description: "Text enhanced successfully"
        });
      }
    } catch (error) {
      console.error('Error enhancing text:', error);
      toast({
        title: "Error",
        description: "Failed to enhance text",
        variant: "destructive"
      });
    }
  };

  const handleImageGeneration = async () => {
    if (!imagePrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter an image prompt",
        variant: "destructive"
      });
      return;
    }

    setImageLoading(true);
    try {
      const enhancedPrompt = `${imageStyle} style: ${imagePrompt.trim()}`;
      
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
            prompt: imagePrompt.trim(),
            result: data.image,
            generation_type: 'image'
          });
          
          fetchGenerations();
          fetchGenerationStats();
        }

        toast({
          title: "Success",
          description: "Image generated successfully!"
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
      setImageLoading(false);
    }
  };

  const handleResearchGeneration = async () => {
    if (!researchPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a research topic",
        variant: "destructive"
      });
      return;
    }

    try {
      const generated = await generateResearch(researchPrompt, selectedResearchModel);
      if (generated) {
        setResearchResult(generated);
        fetchGenerationStats();
        toast({
          title: "Success",
          description: "Research generated successfully"
        });
      }
    } catch (error) {
      console.error('Error generating research:', error);
      toast({
        title: "Error",
        description: "Failed to generate research",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
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

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      if (generatedImage.startsWith('data:image')) {
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
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

  const handleEditGeneration = (generation: any) => {
    setEditingGeneration(generation.id);
    setEditingText(generation.result);
  };

  const handleSaveEdit = async (generationId: string) => {
    try {
      const { error } = await supabase
        .from('ai_generations')
        .update({ result: editingText })
        .eq('id', generationId);

      if (error) throw error;

      setEditingGeneration(null);
      setEditingText('');
      fetchGenerations();
      
      toast({
        title: "Saved",
        description: "Generation updated successfully"
      });
    } catch (error) {
      console.error('Error updating generation:', error);
      toast({
        title: "Error",
        description: "Failed to update generation",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingGeneration(null);
    setEditingText('');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 ml-80 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <Sparkles className="w-10 h-10 text-purple-600" />
                AI Studio
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                Create amazing content and images with the power of AI
              </p>
              <Badge className="mt-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Crown className="w-4 h-4 mr-2" />
                Business Plan Feature
              </Badge>
            </div>
            <Button 
              onClick={() => {
                fetchGenerations();
                fetchGenerationStats();
              }}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Generation Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Generations</p>
                    <p className="text-2xl font-bold">{generationStats.total}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Content Created</p>
                    <p className="text-2xl font-bold">{generationStats.content}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Text Generated</p>
                    <p className="text-2xl font-bold">{generationStats.text}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Images Created</p>
                    <p className="text-2xl font-bold">{generationStats.image}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Image className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Today's Count</p>
                    <p className="text-2xl font-bold">{generationStats.today}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-12">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Content AI
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Text AI
              </TabsTrigger>
              <TabsTrigger value="research" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Research AI
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Image AI
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Content Generation Form */}
                <div className="lg:col-span-2">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-purple-600" />
                        Generate Social Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Business Page Selector */}
                      {myPages.length > 0 && (
                        <div>
                          <Label>Business Page</Label>
                          <Select value={selectedPage} onValueChange={setSelectedPage}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business page" />
                            </SelectTrigger>
                            <SelectContent>
                              {myPages.map((page) => (
                                <SelectItem key={page.id} value={page.id}>
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    {page.page_name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Generation Type */}
                      <div>
                        <Label>Content Type</Label>
                        <Select value={generationType} onValueChange={setGenerationType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="content">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Social Media Post
                              </div>
                            </SelectItem>
                            <SelectItem value="marketing">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Marketing Copy
                              </div>
                            </SelectItem>
                            <SelectItem value="hashtags">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Hashtags
                              </div>
                            </SelectItem>
                            <SelectItem value="translation">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Translation
                              </div>
                            </SelectItem>
                            <SelectItem value="summary">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Summary
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Prompt */}
                      <div>
                        <Label>Prompt</Label>
                        <Textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Describe what you want to generate..."
                          rows={4}
                        />
                      </div>

                      <Button 
                        onClick={handleGenerate}
                        disabled={aiLoading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
                      >
                        {aiLoading ? (
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

                      {/* Result */}
                      {result && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Generated Content</Label>
                            <Button
                              onClick={() => copyToClipboard(result)}
                              variant="outline"
                              size="sm"
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <Textarea
                            value={result}
                            onChange={(e) => setResult(e.target.value)}
                            rows={6}
                            className="mt-2"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Generations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Generations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generations.length > 0 ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {generations.slice(0, 10).map((generation) => (
                          <div key={generation.id} className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {generation.generation_type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(generation.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditGeneration(generation)}
                                className="h-6 px-2"
                              >
                                Edit
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {generation.prompt}
                            </p>
                            {editingGeneration === generation.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  rows={3}
                                  className="text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEdit(generation.id)}
                                    className="h-6 px-2"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    className="h-6 px-2"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm line-clamp-3">
                                {generation.result}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No AI generations yet</p>
                        <p className="text-sm">Start generating content to see your history</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Advanced Text AI
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Generate and enhance text with advanced AI models (DeepSeek Chat V3)
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Text Prompt</Label>
                    <Textarea
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      placeholder="Enter your text generation prompt..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleTextGeneration}
                      disabled={openRouterLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {openRouterLoading ? (
                        <>
                          <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Text
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={handleTextEnhancement}
                      disabled={openRouterLoading || !textResult}
                      variant="outline"
                      className="flex-1"
                    >
                      {openRouterLoading ? 'Enhancing...' : 'Enhance Result'}
                    </Button>
                  </div>

                  {textResult && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Generated/Enhanced Text</Label>
                        <Button
                          onClick={() => copyToClipboard(textResult)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <Textarea
                        value={textResult}
                        onChange={(e) => setTextResult(e.target.value)}
                        rows={8}
                        className="mt-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="research" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    AI Research Assistant
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Generate comprehensive research with advanced reasoning models
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Research Topic</Label>
                    <Textarea
                      value={researchPrompt}
                      onChange={(e) => setResearchPrompt(e.target.value)}
                      placeholder="Enter the topic you want to research..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Research Model</Label>
                    <Select value={selectedResearchModel} onValueChange={setSelectedResearchModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tngtech/deepseek-r1t-chimera:free">
                          DeepSeek R1T Chimera (Recommended)
                        </SelectItem>
                        <SelectItem value="microsoft/mai-ds-r1:free">
                          Microsoft MAI-DS-R1
                        </SelectItem>
                        <SelectItem value="deepseek/deepseek-r1-0528-qwen3-8b:free">
                          DeepSeek R1 Qwen3-8B
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleResearchGeneration}
                    disabled={openRouterLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-12"
                  >
                    {openRouterLoading ? (
                      <>
                        <Brain className="w-4 h-4 mr-2 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Generate Research
                      </>
                    )}
                  </Button>

                  {researchResult && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Research Results</Label>
                        <Button
                          onClick={() => copyToClipboard(researchResult)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <Textarea
                        value={researchResult}
                        onChange={(e) => setResearchResult(e.target.value)}
                        rows={12}
                        className="mt-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image Generation Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="w-5 h-5 text-green-600" />
                      AI Image Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Image Prompt</Label>
                      <Textarea
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Describe the image you want to create..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Style</Label>
                      <Select value={imageStyle} onValueChange={setImageStyle}>
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
                      onClick={handleImageGeneration}
                      disabled={imageLoading || !imagePrompt.trim()}
                      className="w-full bg-green-600 hover:bg-green-700 h-12"
                    >
                      {imageLoading ? (
                        <>
                          <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Image...
                        </>
                      ) : (
                        <>
                          <Image className="w-4 h-4 mr-2" />
                          Generate Image
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Generated Image Display */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Generated Image
                      {generatedImage && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={downloadImage}
                        >
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
                          className="w-full h-auto rounded-lg shadow-lg max-h-80 object-contain mx-auto"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-80 flex items-center justify-center">
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
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-6">
              <AIContentGenerator onGenerationComplete={() => {
                fetchGenerations();
                fetchGenerationStats();
              }} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AIStudio;
