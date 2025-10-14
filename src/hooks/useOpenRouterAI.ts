
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useOpenRouterAI = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateText = async (prompt: string, type: string = 'generate', model?: string): Promise<string | null> => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt for text generation",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      console.log('Calling openrouter-ai function with:', { type, hasPrompt: !!prompt });
      
      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: { prompt, type, model }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Error generating text:', error);
        toast({
          title: "Generation failed",
          description: error.message || "Failed to generate text. Please try again.",
          variant: "destructive"
        });
        return null;
      }

      // Save generation history
      if (user) {
        await supabase
          .from('ai_generations')
          .insert({
            user_id: user.id,
            generation_type: type,
            prompt,
            result: data.generatedText
          });
      }

      return data.generatedText;
    } catch (error) {
      console.error('Error in generateText:', error);
      toast({
        title: "Generation failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const enhanceText = async (text: string): Promise<string | null> => {
    return generateText(text, 'enhance');
  };

  const generateResearch = async (topic: string, model?: string): Promise<string | null> => {
    return generateText(topic, 'research', model);
  };

  return {
    generateText,
    enhanceText,
    generateResearch,
    loading
  };
};
