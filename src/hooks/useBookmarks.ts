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

export const useBookmarks = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBookmarkedPosts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get bookmarked posts
      const { data: bookmarkedData, error } = await supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookmarked posts:', error);
        return;
      }

      if (!bookmarkedData || bookmarkedData.length === 0) {
        setBookmarkedPosts([]);
        return;
      }

      // Get the actual posts
      const postIds = bookmarkedData.map(b => b.post_id);
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .in('id', postIds);

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return;
      }

      if (!postsData || postsData.length === 0) {
        setBookmarkedPosts([]);
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

      setBookmarkedPosts(enrichedPosts);
    } catch (error) {
      console.error('Error in fetchBookmarkedPosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark posts",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if post is already bookmarked
      const { data: existingBookmark, error: checkError } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking bookmark:', checkError);
        toast({
          title: "Error",
          description: "Failed to check bookmark status",
          variant: "destructive"
        });
        return;
      }

      if (existingBookmark) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) {
          console.error('Error removing bookmark:', error);
          toast({
            title: "Error removing bookmark",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Bookmark removed",
          description: "Post has been removed from your bookmarks."
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            post_id: postId
          });

        if (error) {
          console.error('Error adding bookmark:', error);
          toast({
            title: "Error adding bookmark",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Post bookmarked",
          description: "Post has been added to your bookmarks."
        });
      }

      // Refresh bookmarked posts
      fetchBookmarkedPosts();
    } catch (error) {
      console.error('Error in toggleBookmark:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const isPostBookmarked = (postId: string): boolean => {
    return bookmarkedPosts.some(post => post.id === postId);
  };

  useEffect(() => {
    fetchBookmarkedPosts();
  }, [user]);

  return {
    bookmarkedPosts,
    loading,
    toggleBookmark,
    isPostBookmarked,
    refetch: fetchBookmarkedPosts
  };
};