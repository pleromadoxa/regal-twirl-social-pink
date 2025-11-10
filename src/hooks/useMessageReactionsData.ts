import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export const useMessageReactionsData = (messageId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch reactions
  useEffect(() => {
    if (!messageId) return;

    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId);

      if (error) {
        console.error('Error fetching reactions:', error);
      } else {
        setReactions(data || []);
      }
      setLoading(false);
    };

    fetchReactions();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`reactions:${messageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReactions((prev) => [...prev, payload.new as Reaction]);
          } else if (payload.eventType === 'DELETE') {
            setReactions((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId]);

  const addReaction = async (emoji: string) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: user.id,
        emoji,
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add reaction',
        variant: 'destructive',
      });
    }
  };

  const removeReaction = async (emoji: string) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove reaction',
        variant: 'destructive',
      });
    }
  };

  const toggleReaction = async (emoji: string) => {
    if (!user?.id) return;

    const existingReaction = reactions.find(
      (r) => r.user_id === user.id && r.emoji === emoji
    );

    if (existingReaction) {
      await removeReaction(emoji);
    } else {
      await addReaction(emoji);
    }
  };

  const getReactionCount = (emoji: string) => {
    return reactions.filter((r) => r.emoji === emoji).length;
  };

  const hasUserReacted = (emoji: string) => {
    return reactions.some((r) => r.user_id === user?.id && r.emoji === emoji);
  };

  return {
    reactions,
    loading,
    addReaction,
    removeReaction,
    toggleReaction,
    getReactionCount,
    hasUserReacted,
  };
};
