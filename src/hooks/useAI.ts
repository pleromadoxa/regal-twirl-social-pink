
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateCaption = async (prompt: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use AI features",
        variant: "destructive"
      });
      return null;
    }

    try {
      setLoading(true);
      
      // Check user's AI generation limit
      const { data: profile } = await supabase
        .from('profiles')
        .select('ai_generations_used, ai_generations_limit, premium_tier')
        .eq('id', user.id)
        .single();

      if (profile && profile.ai_generations_used >= profile.ai_generations_limit) {
        toast({
          title: "Generation limit reached",
          description: "Upgrade to premium for unlimited AI generations",
          variant: "destructive"
        });
        return null;
      }

      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: { 
          prompt,
          type: 'caption'
        }
      });

      if (error) throw error;

      // Update usage count
      await supabase
        .from('profiles')
        .update({ 
          ai_generations_used: (profile?.ai_generations_used || 0) + 1 
        })
        .eq('id', user.id);

      // Save generation history
      await supabase
        .from('ai_generations')
        .insert({
          user_id: user.id,
          generation_type: 'caption',
          prompt,
          result: data.generatedText
        });

      return data.generatedText;
    } catch (error) {
      console.error('Error generating caption:', error);
      toast({
        title: "Error generating caption",
        description: "Please try again later",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const enhanceContent = async (content: string) => {
    if (!user) return null;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: { 
          prompt: `Enhance this social media post: "${content}"`,
          type: 'enhancement'
        }
      });

      if (error) throw error;

      await supabase
        .from('ai_generations')
        .insert({
          user_id: user.id,
          generation_type: 'enhancement',
          prompt: content,
          result: data.generatedText
        });

      return data.generatedText;
    } catch (error) {
      console.error('Error enhancing content:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateHashtags = async (content: string) => {
    if (!user) return null;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: { 
          prompt: `Generate 5-8 relevant hashtags for this post: "${content}"`,
          type: 'hashtags'
        }
      });

      if (error) throw error;

      await supabase
        .from('ai_generations')
        .insert({
          user_id: user.id,
          generation_type: 'hashtags',
          prompt: content,
          result: data.generatedText
        });

      return data.generatedText;
    } catch (error) {
      console.error('Error generating hashtags:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const translateContent = async (content: string, targetLanguage: string) => {
    if (!user) return null;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: { 
          prompt: `Translate this text to ${targetLanguage}: "${content}"`,
          type: 'translation'
        }
      });

      if (error) throw error;

      await supabase
        .from('ai_generations')
        .insert({
          user_id: user.id,
          generation_type: 'translation',
          prompt: `${content} -> ${targetLanguage}`,
          result: data.generatedText
        });

      return data.generatedText;
    } catch (error) {
      console.error('Error translating content:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const summarizeContent = async (content: string) => {
    if (!user) return null;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: { 
          prompt: `Summarize this content in 2-3 sentences: "${content}"`,
          type: 'summary'
        }
      });

      if (error) throw error;

      await supabase
        .from('ai_generations')
        .insert({
          user_id: user.id,
          generation_type: 'summary',
          prompt: content,
          result: data.generatedText
        });

      return data.generatedText;
    } catch (error) {
      console.error('Error summarizing content:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateResponseSuggestions = async (originalPost: string) => {
    if (!user) return null;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: { 
          prompt: `Generate 3 different response suggestions for this post: "${originalPost}"`,
          type: 'response_suggestions'
        }
      });

      if (error) throw error;

      await supabase
        .from('ai_generations')
        .insert({
          user_id: user.id,
          generation_type: 'response_suggestions',
          prompt: originalPost,
          result: data.generatedText
        });

      return data.generatedText;
    } catch (error) {
      console.error('Error generating response suggestions:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateCaption,
    enhanceContent,
    generateHashtags,
    translateContent,
    summarizeContent,
    generateResponseSuggestions,
    loading
  };
};
