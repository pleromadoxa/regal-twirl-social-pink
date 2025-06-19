
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Clock, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const AIGenerationHistory = () => {
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchGenerations();
    }
  }, [user]);

  const fetchGenerations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_generations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setGenerations(data || []);
    } catch (error) {
      console.error('Error fetching generations:', error);
      toast({
        title: "Error",
        description: "Failed to load generation history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
      console.error('Failed to copy text:', error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const getGenerationTypeIcon = (type: string) => {
    switch (type) {
      case 'caption':
        return '📝';
      case 'hashtags':
        return '#️⃣';
      case 'enhancement':
        return '✨';
      case 'translation':
        return '🌐';
      case 'summary':
        return '📄';
      case 'response_suggestions':
        return '💬';
      default:
        return '🤖';
    }
  };

  const getGenerationTypeColor = (type: string) => {
    switch (type) {
      case 'caption':
        return 'bg-blue-100 text-blue-800';
      case 'hashtags':
        return 'bg-purple-100 text-purple-800';
      case 'enhancement':
        return 'bg-green-100 text-green-800';
      case 'translation':
        return 'bg-orange-100 text-orange-800';
      case 'summary':
        return 'bg-yellow-100 text-yellow-800';
      case 'response_suggestions':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Generations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Generations ({generations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {generations.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Generations Yet</h3>
            <p className="text-gray-500">Start using AI tools to see your generation history here!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {generations.map((generation) => (
              <div
                key={generation.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getGenerationTypeIcon(generation.generation_type)}</span>
                    <Badge className={getGenerationTypeColor(generation.generation_type)}>
                      {generation.generation_type.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(generation.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generation.result)}
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Prompt:</p>
                    <p className="text-sm text-gray-600 bg-gray-100 rounded p-2 line-clamp-2">
                      {generation.prompt}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Result:</p>
                    <p className="text-sm text-gray-800 bg-white border rounded p-2 line-clamp-3">
                      {generation.result}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIGenerationHistory;
