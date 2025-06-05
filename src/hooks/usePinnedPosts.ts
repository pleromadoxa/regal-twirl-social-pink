
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
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
    is_verified: boolean;
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
      
      const { data: pinnedData, error } = await supabase
        .from('pinned_posts')
        .select(`
          *,
          posts (
            *,
            profiles (username, display_name, avatar_url, is_verified)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pinned posts:', error);
        return;
      }

      // Transform data to match Post interface
      const enrichedPosts: Post[] = (pinnedData || []).map(item => ({
        id: item.posts.id,
        content: item.posts.content,
        user_id: item.posts.user_id,
        created_at: item.posts.created_at,
        updated_at: item.posts.updated_at,
        likes_count: item.posts.likes_count || 0,
        retweets_count: item.posts.retweets_count || 0,
        replies_count: item.posts.replies_count || 0,
        profiles: item.posts.profiles
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
