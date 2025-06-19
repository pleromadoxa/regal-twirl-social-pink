
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
import { 
  Sparkles, 
  Wand2, 
  FileText, 
  Image, 
  MessageSquare,
  Building2,
  Crown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AIStudio = () => {
  const { user } = useAuth();
  const { myPages } = useBusinessPages();
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [generationType, setGenerationType] = useState<string>('content');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [generations, setGenerations] = useState<any[]>([]);

  useEffect(() => {
    if (myPages.length > 0 && !selectedPage) {
      setSelectedPage(myPages[0].id);
    }
  }, [myPages, selectedPage]);

  useEffect(() => {
    fetchGenerations();
  }, [user]);

  const fetchGenerations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_generations')
        .select('*')
        .eq('user_id', user.id)
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

    setLoading(true);
    try {
      // Mock AI generation for now
      const mockResult = `Generated ${generationType} based on: "${prompt}"`;
      
      // Save to database
      const { error } = await supabase
        .from('ai_generations')
        .insert({
          user_id: user?.id,
          generation_type: generationType,
          prompt,
          result: mockResult
        });

      if (error) throw error;

      setResult(mockResult);
      fetchGenerations();
      
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
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 ml-80 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-purple-600" />
                AI Studio
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Generate content for your business with AI
              </p>
              <Badge className="mt-2 bg-gradient-to-r from-amber-500 to-orange-500">
                <Crown className="w-3 h-3 mr-1" />
                Business Plan Feature
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Generate Content
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
                          <FileText className="w-4 h-4" />
                          Social Media Post
                        </div>
                      </SelectItem>
                      <SelectItem value="marketing">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Marketing Copy
                        </div>
                      </SelectItem>
                      <SelectItem value="description">
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Product Description
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
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? 'Generating...' : 'Generate Content'}
                </Button>

                {/* Result */}
                {result && (
                  <div>
                    <Label>Generated Content</Label>
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

            {/* Recent Generations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Generations</CardTitle>
              </CardHeader>
              <CardContent>
                {generations.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generations.map((generation) => (
                      <div key={generation.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {generation.generation_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(generation.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {generation.prompt}
                        </p>
                        <p className="text-sm">
                          {generation.result}
                        </p>
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
        </div>
      </div>
    </div>
  );
};

export default AIStudio;
