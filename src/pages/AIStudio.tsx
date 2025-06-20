
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
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
  Image,
  Code,
  FileText,
  Brain
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
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [generationType, setGenerationType] = useState('text');
  const [loading, setLoading] = useState(false);
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

    // Check if user has remaining generations
    const remainingGenerations = (userProfile?.ai_generations_limit || 5) - (userProfile?.ai_generations_used || 0);
    if (remainingGenerations <= 0) {
      toast({
        title: "Generation limit reached",
        description: "Upgrade to premium for unlimited AI generations",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Call the AI generation edge function
      const { data, error } = await supabase.functions.invoke('ai-generate', {
        body: {
          prompt: prompt.trim(),
          type: generationType
        }
      });

      if (error) throw error;

      // Save the generation to database
      const { error: saveError } = await supabase
        .from('ai_generations')
        .insert([{
          user_id: user?.id,
          generation_type: generationType,
          prompt: prompt.trim(),
          result: data.result
        }]);

      if (saveError) throw saveError;

      // Update user's generation count
      await supabase
        .from('profiles')
        .update({ 
          ai_generations_used: (userProfile?.ai_generations_used || 0) + 1 
        })
        .eq('id', user?.id);

      toast({
        title: "Generation complete",
        description: "Your AI content has been generated successfully"
      });

      setPrompt('');
      fetchGenerations();
      fetchUserProfile();
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate AI content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  const remainingGenerations = (userProfile?.ai_generations_limit || 5) - (userProfile?.ai_generations_used || 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto text-purple-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">AI Studio</h1>
          <p className="text-gray-600 dark:text-gray-400">Please sign in to access AI Studio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 ml-80 mr-96 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-600" />
                AI Studio
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Generate content with advanced AI models
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={remainingGenerations > 0 ? "default" : "destructive"}>
                <Zap className="w-4 h-4 mr-1" />
                {remainingGenerations} generations left
              </Badge>
              {userProfile?.premium_tier !== 'free' && (
                <Badge variant="secondary">
                  Premium
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Generation Interface */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Generation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Generation Type</label>
                    <Select value={generationType} onValueChange={setGenerationType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Text Content
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
                    <label className="text-sm font-medium">Prompt</label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Enter your prompt here... Be specific about what you want the AI to generate."
                      className="mt-1 min-h-[120px]"
                    />
                  </div>

                  <Button 
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim() || remainingGenerations <= 0}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
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

              {/* Recent Generations */}
              {generations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Recent Generations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {generations.map((generation) => (
                          <div key={generation.id} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              {getGenerationIcon(generation.generation_type)}
                              <Badge variant="outline" className="capitalize">
                                {generation.generation_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {new Date(generation.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Prompt:</p>
                                <p className="text-sm">{generation.prompt}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Result:</p>
                                <div className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                                  <pre className="whitespace-pre-wrap">{generation.result}</pre>
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
            </div>

            {/* Usage Stats & Tips */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Generations Used</span>
                      <span>{userProfile?.ai_generations_used || 0}/{userProfile?.ai_generations_limit || 5}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(100, ((userProfile?.ai_generations_used || 0) / (userProfile?.ai_generations_limit || 5)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Tier: <span className="font-medium capitalize">{userProfile?.premium_tier || 'free'}</span></p>
                    <p>Resets: Monthly</p>
                  </div>

                  {userProfile?.premium_tier === 'free' && (
                    <Button size="sm" className="w-full">
                      Upgrade for Unlimited
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tips for Better Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p>Be specific and detailed in your prompts</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p>Include context and desired format</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p>Use examples when possible</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p>Specify tone and style preferences</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default AIStudio;
