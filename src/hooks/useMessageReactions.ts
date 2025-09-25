import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export const useMessageReactions = (messageId: string) => {
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReactions(data || []);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const addReaction = async (emoji: string, userId: string) => {
    try {
      setIsLoading(true);
      
      // Check if user already reacted with this emoji
      const existingReaction = reactions.find(
        r => r.user_id === userId && r.emoji === emoji
      );

      if (existingReaction) {
        // Remove existing reaction
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (error) throw error;
      } else {
        // Add new reaction
        const { error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: userId,
            emoji: emoji
          });

        if (error) throw error;
      }

      await fetchReactions();
    } catch (error) {
      console.error('Error managing reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getReactionCounts = () => {
    const counts: { [emoji: string]: number } = {};
    reactions.forEach(reaction => {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    });
    return counts;
  };

  const getUserReactions = (userId: string) => {
    return reactions
      .filter(reaction => reaction.user_id === userId)
      .map(reaction => reaction.emoji);
  };

  useEffect(() => {
    if (messageId) {
      fetchReactions();

      // Set up realtime subscription
      const subscription = supabase
        .channel(`message_reactions:${messageId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'message_reactions',
            filter: `message_id=eq.${messageId}`
          },
          () => {
            fetchReactions();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [messageId]);

  return {
    reactions,
    isLoading,
    addReaction,
    getReactionCounts,
    getUserReactions,
    refetch: fetchReactions
  };
};