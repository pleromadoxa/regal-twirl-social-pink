import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useProfilePosts = (userId?: string) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserPosts = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url,
            is_verified
          ),
          likes:likes!post_id (count),
          retweets:retweets!post_id (count),
          replies:replies!post_id (count),
          post_views:post_views!post_id (count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedPosts = postsData?.map(post => ({
        ...post,
        likes_count: post.likes?.[0]?.count || 0,
        retweets_count: post.retweets?.[0]?.count || 0,
        replies_count: post.replies?.[0]?.count || 0,
        views_count: post.post_views?.[0]?.count || 0,
        user_liked: false, // Would need to check if current user liked
        user_retweeted: false, // Would need to check if current user retweeted
      })) || [];

      setPosts(processedPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
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