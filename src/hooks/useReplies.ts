
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Reply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const useReplies = (postId: string) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReplies = async () => {
    if (!postId) return;
    
    try {
      setLoading(true);
      const { data: repliesData, error } = await supabase
        .from('replies')
        .select(`
          id,
          post_id,
          user_id,
          content,
          created_at,
          updated_at,
          profiles!user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching replies:', error);
        return;
      }

      // Transform the data to match our Reply interface
      const transformedReplies = repliesData?.map(reply => ({
        id: reply.id,
        post_id: reply.post_id,
        user_id: reply.user_id,
        content: reply.content,
        created_at: reply.created_at,
        updated_at: reply.updated_at,
        profiles: {
          username: reply.profiles?.username || 'Anonymous',
          display_name: reply.profiles?.display_name || 'Anonymous',
          avatar_url: reply.profiles?.avatar_url || ''
        }
      })) || [];

      setReplies(transformedReplies);
    } catch (error) {
      console.error('Error in fetchReplies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReply = async (content: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to reply",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('replies')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: content.trim(),
          }
        ]);

      if (error) {
        console.error('Error creating reply:', error);
        toast({
          title: "Error creating reply",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Reply posted!",
        description: "Your reply has been added."
      });

      fetchReplies();
    } catch (error) {
      console.error('Error in createReply:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const deleteReply = async (replyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('replies')
        .delete()
        .eq('id', replyId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting reply:', error);
        toast({
          title: "Error deleting reply",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Reply deleted",
        description: "Your reply has been deleted."
      });

      setReplies(replies.filter(r => r.id !== replyId));
    } catch (error) {
      console.error('Error in deleteReply:', error);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, [postId]);

  return {
    replies,
    loading,
    createReply,
    deleteReply,
    refetch: fetchReplies
  };
};
