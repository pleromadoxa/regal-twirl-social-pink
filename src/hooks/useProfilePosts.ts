
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
      
      // First get posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('useProfilePosts: Posts query error:', postsError);
        setPosts([]);
        return;
      }

      console.log('useProfilePosts: Posts data received:', postsData);

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Then get the profile data for the user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('useProfilePosts: Profile query error:', profileError);
        // Still show posts even if profile fails
      }

      const processedPosts = postsData.map(post => ({
        ...post,
        profiles: profileData || {
          id: userId,
          username: 'Unknown',
          display_name: 'Unknown User',
          avatar_url: null,
          is_verified: false
        },
        likes_count: post.likes_count || 0,
        retweets_count: post.retweets_count || 0,
        replies_count: post.replies_count || 0,
        views_count: post.views_count || 0,
        user_liked: false,
        user_retweeted: false,
      }));

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
