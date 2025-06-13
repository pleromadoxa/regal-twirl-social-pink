
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  retweets_count: number;
  replies_count: number;
  image_urls?: string[];
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
    is_verified: boolean;
    premium_tier: string;
  };
}

export const usePinnedPosts = () => {
  const [pinnedPosts, setPinnedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPinnedPosts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get pinned posts
      const { data: pinnedData, error } = await supabase
        .from('pinned_posts')
        .select('post_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pinned posts:', error);
        return;
      }

      if (!pinnedData || pinnedData.length === 0) {
        setPinnedPosts([]);
        return;
      }

      // Get the actual posts
      const postIds = pinnedData.map(p => p.post_id);
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .in('id', postIds);

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return;
      }

      if (!postsData || postsData.length === 0) {
        setPinnedPosts([]);
        return;
      }

      // Get user profiles
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_verified, premium_tier')
        .in('id', userIds);

      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.id, profile])
      );

      // Transform data to match Post interface
      const enrichedPosts: Post[] = postsData.map(post => ({
        id: post.id,
        content: post.content,
        user_id: post.user_id,
        created_at: post.created_at,
        updated_at: post.updated_at,
        likes_count: post.likes_count || 0,
        retweets_count: post.retweets_count || 0,
        replies_count: post.replies_count || 0,
        image_urls: post.image_urls || [],
        profiles: profilesMap.get(post.user_id) || {
          username: 'unknown',
          display_name: 'Unknown User',
          avatar_url: '',
          is_verified: false,
          premium_tier: 'free'
        }
      }));

      setPinnedPosts(enrichedPosts);
    } catch (error) {
      console.error('Error in fetchPinnedPosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to pin posts",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if post is already pinned
      const { data: existingPin } = await supabase
        .from('pinned_posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      if (existingPin) {
        // Unpin the post
        const { error } = await supabase
          .from('pinned_posts')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) {
          console.error('Error unpinning post:', error);
          toast({
            title: "Error unpinning post",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Post unpinned",
          description: "Post has been removed from your pinned posts."
        });
      } else {
        // Pin the post
        const { error } = await supabase
          .from('pinned_posts')
          .insert({
            user_id: user.id,
            post_id: postId
          });

        if (error) {
          console.error('Error pinning post:', error);
          toast({
            title: "Error pinning post",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Post pinned",
          description: "Post has been added to your pinned posts."
        });
      }

      // Refresh pinned posts
      fetchPinnedPosts();
    } catch (error) {
      console.error('Error in togglePin:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const isPostPinned = (postId: string): boolean => {
    return pinnedPosts.some(post => post.id === postId);
  };

  useEffect(() => {
    fetchPinnedPosts();
  }, [user]);

  return {
    pinnedPosts,
    loading,
    togglePin,
    isPostPinned,
    refetch: fetchPinnedPosts
  };
};
