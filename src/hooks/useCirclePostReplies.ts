import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CirclePostReply {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const useCirclePostReplies = (postId?: string) => {
  const [replies, setReplies] = useState<CirclePostReply[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReplies = async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('circle_post_replies')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Fetch profiles separately
      if (data && data.length > 0) {
        const authorIds = [...new Set(data.map(reply => reply.author_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', authorIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        const repliesWithProfiles = data.map(reply => ({
          ...reply,
          profiles: profileMap.get(reply.author_id),
        }));
        
        setReplies(repliesWithProfiles as any);
      } else {
        setReplies([]);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load replies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createReply = async (content: string) => {
    if (!postId) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('circle_post_replies')
        .insert({
          post_id: postId,
          author_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Reply posted successfully',
      });

      fetchReplies();
      return data;
    } catch (error) {
      console.error('Error creating reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to post reply',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteReply = async (replyId: string) => {
    try {
      const { error } = await supabase
        .from('circle_post_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Reply deleted successfully',
      });

      fetchReplies();
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete reply',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (postId) {
      fetchReplies();
    }
  }, [postId]);

  return {
    replies,
    loading,
    createReply,
    deleteReply,
    refetch: fetchReplies,
  };
};