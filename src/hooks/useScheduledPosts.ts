import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ScheduledPost {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  scheduled_at: string;
  published_at: string | null;
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  post_id: string | null;
  metadata: any;
  created_at: string;
}

export const useScheduledPosts = () => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchScheduledPosts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setScheduledPosts((data as ScheduledPost[]) || []);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const schedulePost = async (content: string, scheduledAt: Date, mediaUrls: string[] = []) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          content,
          media_urls: mediaUrls,
          scheduled_at: scheduledAt.toISOString(),
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Post scheduled",
        description: `Your post will be published on ${scheduledAt.toLocaleString()}`
      });

      await fetchScheduledPosts();
      return data;
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast({
        title: "Error",
        description: "Failed to schedule post",
        variant: "destructive"
      });
      return null;
    }
  };

  const cancelScheduledPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .update({ status: 'cancelled' })
        .eq('id', postId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({ title: "Scheduled post cancelled" });
      await fetchScheduledPosts();
    } catch (error) {
      console.error('Error cancelling scheduled post:', error);
      toast({
        title: "Error",
        description: "Failed to cancel scheduled post",
        variant: "destructive"
      });
    }
  };

  const deleteScheduledPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({ title: "Scheduled post deleted" });
      await fetchScheduledPosts();
    } catch (error) {
      console.error('Error deleting scheduled post:', error);
      toast({
        title: "Error",
        description: "Failed to delete scheduled post",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchScheduledPosts();
  }, [user]);

  return {
    scheduledPosts,
    loading,
    schedulePost,
    cancelScheduledPost,
    deleteScheduledPost,
    refetch: fetchScheduledPosts
  };
};
