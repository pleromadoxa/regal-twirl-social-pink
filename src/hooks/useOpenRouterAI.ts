
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOpenRouterAI = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateText = async (prompt: string): Promise<string | null> => {
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
      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: { prompt, type: 'generate' }
      });

      if (error) {
        console.error('Error generating text:', error);
        toast({
          title: "Generation failed",
          description: "Failed to generate text. Please try again.",
          variant: "destructive"
        });
        return null;
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
    if (!text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter text to enhance",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('openrouter-ai', {
        body: { prompt: text, type: 'enhance' }
      });

      if (error) {
        console.error('Error enhancing text:', error);
        toast({
          title: "Enhancement failed",
          description: "Failed to enhance text. Please try again.",
          variant: "destructive"
        });
        return null;
      }

      return data.generatedText;
    } catch (error) {
      console.error('Error in enhanceText:', error);
      toast({
        title: "Enhancement failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateText,
    enhanceText,
    loading
  };
};
