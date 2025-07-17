
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useProfilePosts = (userId?: string) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserPosts = async () => {
    if (!userId) {
      console.log('useProfilePosts: No userId provided');
      setLoading(false);
      setPosts([]);
      return;
    }
    
    try {
      setLoading(true);
      console.log('useProfilePosts: Fetching posts for userId:', userId);
      
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useProfilePosts: Query error:', error);
        // Don't throw error, just log it and show empty state
        setPosts([]);
        return;
      }

      console.log('useProfilePosts: Raw data received:', postsData);

      const processedPosts = postsData?.map(post => ({
        ...post,
        likes_count: post.likes_count || 0,
        retweets_count: post.retweets_count || 0,
        replies_count: post.replies_count || 0,
        views_count: post.views_count || 0,
        user_liked: false,
        user_retweeted: false,
      })) || [];

      console.log('useProfilePosts: Processed posts:', processedPosts);
      setPosts(processedPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, [userId]);

  return {
    posts,
    loading,
    refetch: fetchUserPosts
  };
};
