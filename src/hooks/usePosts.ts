
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  retweets_count: number;
  replies_count: number;
  user_liked?: boolean;
  user_retweeted?: boolean;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
    is_verified: boolean;
  };
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Query posts and join with profiles table
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      if (user) {
        // Get user likes and retweets
        const postIds = postsData?.map(post => post.id) || [];
        
        const [likesData, retweetsData] = await Promise.all([
          supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds),
          supabase
            .from('retweets')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds)
        ]);

        const userLikedPosts = new Set(likesData.data?.map(like => like.post_id) || []);
        const userRetweetedPosts = new Set(retweetsData.data?.map(retweet => retweet.post_id) || []);

        const enrichedPosts = postsData?.map(post => ({
          ...post,
          user_liked: userLikedPosts.has(post.id),
          user_retweeted: userRetweetedPosts.has(post.id),
          likes_count: post.likes_count || 0,
          retweets_count: post.retweets_count || 0,
          replies_count: post.replies_count || 0,
          profiles: post.profiles || {
            username: 'unknown',
            display_name: 'Unknown User',
            avatar_url: '',
            is_verified: false
          }
        })) || [];

        setPosts(enrichedPosts);
      } else {
        const enrichedPosts = postsData?.map(post => ({
          ...post,
          likes_count: post.likes_count || 0,
          retweets_count: post.retweets_count || 0,
          replies_count: post.replies_count || 0,
          profiles: post.profiles || {
            username: 'unknown',
            display_name: 'Unknown User',
            avatar_url: '',
            is_verified: false
          }
        })) || [];
        
        setPosts(enrichedPosts);
      }
    } catch (error) {
      console.error('Error in fetchPosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            content: content.trim(),
          }
        ]);

      if (error) {
        console.error('Error creating post:', error);
        toast({
          title: "Error creating post",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Post created!",
        description: "Your post has been published successfully."
      });

      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error in createPost:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.user_liked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert([{ user_id: user.id, post_id: postId }]);
      }

      // Update local state
      setPosts(posts.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              user_liked: !p.user_liked,
              likes_count: p.user_liked ? p.likes_count - 1 : p.likes_count + 1
            }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleRetweet = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.user_retweeted) {
        // Un-retweet
        await supabase
          .from('retweets')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
      } else {
        // Retweet
        await supabase
          .from('retweets')
          .insert([{ user_id: user.id, post_id: postId }]);
      }

      // Update local state
      setPosts(posts.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              user_retweeted: !p.user_retweeted,
              retweets_count: p.user_retweeted ? p.retweets_count - 1 : p.retweets_count + 1
            }
          : p
      ));
    } catch (error) {
      console.error('Error toggling retweet:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  return {
    posts,
    loading,
    createPost,
    toggleLike,
    toggleRetweet,
    refetch: fetchPosts
  };
};
