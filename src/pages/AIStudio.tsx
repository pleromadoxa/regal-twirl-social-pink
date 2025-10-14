
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePosts } from '@/hooks/usePosts';
import { useOpenRouterAI } from '@/hooks/useOpenRouterAI';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  Send, 
  History, 
  Zap,
  MessageSquare,
  FileText,
  Code,
  Brain,
  Copy,
  Share,
  Wand2
} from 'lucide-react';

interface Generation {
  id: string;
  generation_type: string;
  prompt: string;
  result: string;
  created_at: string;
}

const AIStudio = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { createPost } = usePosts();
  const { generateText, loading } = useOpenRouterAI();
  const [prompt, setPrompt] = useState('');
  const [generationType, setGenerationType] = useState('text');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchGenerations();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchGenerations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_generations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setGenerations(data || []);
    } catch (error) {
      console.error('Error fetching generations:', error);
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

    const enhancedPrompt = getEnhancedPrompt(prompt, generationType);
    const result = await generateText(enhancedPrompt, generationType);
    
    if (result) {
      setGeneratedContent(result);
      setPrompt('');
      fetchGenerations();
      fetchUserProfile();
    }
  };

  const getEnhancedPrompt = (userPrompt: string, type: string) => {
    switch (type) {
      case 'creative':
        return `Write a creative and engaging piece based on: ${userPrompt}`;
      case 'code':
        return `Generate code for: ${userPrompt}. Include comments and best practices.`;
      case 'chat':
        return `Respond conversationally to: ${userPrompt}`;
      default:
        return `Create professional content about: ${userPrompt}`;
    }
  };

  const handlePostToFeed = async () => {
    if (!generatedContent.trim()) return;

    try {
      await createPost(generatedContent);
      toast({
        title: "Posted to Feed",
        description: "Your AI-generated content has been shared!"
      });
      setGeneratedContent('');
    } catch (error) {
      console.error('Error posting to feed:', error);
      toast({
        title: "Error",
        description: "Failed to post to feed",
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

  const getGenerationIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4" />;
      case 'code': return <Code className="w-4 h-4" />;
      case 'creative': return <Sparkles className="w-4 h-4" />;
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const remainingGenerations = (userProfile?.ai_generations_limit || 10) - (userProfile?.ai_generations_used || 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-white/80 backdrop-blur-xl border-purple-200">
          <CardContent className="text-center">
            <Brain className="w-16 h-16 mx-auto text-purple-400 mb-4" />
            <h1 className="text-2xl font-bold mb-2">AI Studio</h1>
            <p className="text-gray-600 dark:text-gray-400">Please sign in to access AI Studio</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'ml-80 mr-96 border-x border-purple-200 dark:border-purple-800'} bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl`}>
        {/* Header */}
        <div className={`sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl ${isMobile ? '' : 'border-b border-purple-200 dark:border-purple-800'} ${isMobile ? 'p-3' : 'p-6'} z-10`}>
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
            <div>
              <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3`}>
                <Brain className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-purple-600`} />
                AI Studio
              </h1>
              <p className={`text-slate-600 dark:text-slate-400 ${isMobile ? 'text-sm mt-1' : 'mt-2'}`}>
                Generate amazing content with advanced AI models
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={remainingGenerations > 0 ? "default" : "destructive"} className={`bg-gradient-to-r from-purple-500 to-pink-500 ${isMobile ? 'text-xs' : ''}`}>
                <Zap className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
                {remainingGenerations} generations left
              </Badge>
            </div>
          </div>
        </div>

        <div className={`${isMobile ? 'p-3' : 'p-6'} space-y-6`}>
          {/* Main Generation Interface */}
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-2 gap-6'}`}>
            {/* Input Panel */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Wand2 className="w-5 h-5" />
                  AI Content Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 block">Content Type</label>
                  <Select value={generationType} onValueChange={setGenerationType}>
                    <SelectTrigger className="border-blue-200 dark:border-blue-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Professional Content
                        </div>
                      </SelectItem>
                      <SelectItem value="creative">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Creative Writing
                        </div>
                      </SelectItem>
                      <SelectItem value="code">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          Code Generation
                        </div>
                      </SelectItem>
                      <SelectItem value="chat">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Chat Response
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 block">Your Prompt</label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you want to create... Be specific for best results!"
                    className="min-h-[120px] border-blue-200 dark:border-blue-700 focus:border-blue-400 dark:focus:border-blue-500"
                  />
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim() || remainingGenerations <= 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating Magic...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Generate Content
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output Panel */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-700 dark:text-green-300">Generated Content</CardTitle>
                  {generatedContent && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handlePostToFeed}
                        className="bg-green-100 hover:bg-green-200 text-green-700 border-green-200"
                      >
                        <Share className="w-4 h-4 mr-1" />
                        Post to Feed
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(generatedContent)}
                        className="bg-green-100 hover:bg-green-200 text-green-700 border-green-200"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <Textarea
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      className="min-h-[300px] border-0 bg-transparent resize-none focus-visible:ring-0"
                      placeholder="Your generated content will appear here..."
                    />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-8 min-h-[300px] flex items-center justify-center border border-green-200 dark:border-green-700">
                    <div className="text-center">
                      <Sparkles className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <p className="text-green-600 dark:text-green-400 font-medium">
                        Your AI-generated content will appear here
                      </p>
                      <p className="text-sm text-green-500 dark:text-green-500 mt-2">
                        Ready to create something amazing?
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Generation History */}
          {generations.length > 0 && (
            <Card className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <History className="w-5 h-5" />
                  Recent Generations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {generations.map((generation) => (
                      <div key={generation.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getGenerationIcon(generation.generation_type)}
                            <Badge variant="outline" className="capitalize border-purple-200 text-purple-700">
                              {generation.generation_type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(generation.result)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <span className="text-xs text-gray-500">
                              {new Date(generation.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Prompt:</p>
                            <p className="text-sm bg-purple-50 dark:bg-purple-900/30 p-2 rounded border">
                              {generation.prompt}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Generated:</p>
                            <div className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded border max-h-32 overflow-y-auto">
                              <pre className="whitespace-pre-wrap text-xs">{generation.result}</pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Usage Stats */}
          <Card className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-orange-700 dark:text-orange-300">Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-orange-600 dark:text-orange-400">Generations Used</span>
                  <span className="font-medium">{userProfile?.ai_generations_used || 0}/{userProfile?.ai_generations_limit || 10}</span>
                </div>
                <div className="w-full bg-orange-200 dark:bg-orange-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, ((userProfile?.ai_generations_used || 0) / (userProfile?.ai_generations_limit || 10)) * 100)}%` 
                    }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                  <p className="text-orange-600 dark:text-orange-400">Current Tier</p>
                  <p className="font-medium capitalize">{userProfile?.premium_tier || 'free'}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                  <p className="text-orange-600 dark:text-orange-400">Resets</p>
                  <p className="font-medium">Monthly</p>
                </div>
              </div>

              {userProfile?.premium_tier === 'free' && (
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade for More Generations
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default AIStudio;
