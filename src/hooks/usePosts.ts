
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  retweets_count: number;
  replies_count: number;
  user_id: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string | null;
    is_verified: boolean;
  };
  user_liked?: boolean;
  user_retweeted?: boolean;
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check if user has liked or retweeted each post
      if (user && data) {
        const postsWithUserActions = await Promise.all(
          data.map(async (post) => {
            const [likesResult, retweetsResult] = await Promise.all([
              supabase
                .from('likes')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', user.id)
                .single(),
              supabase
                .from('retweets')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', user.id)
                .single()
            ]);

            return {
              ...post,
              user_liked: !likesResult.error,
              user_retweeted: !retweetsResult.error
            };
          })
        );
        setPosts(postsWithUserActions);
      } else {
        setPosts(data || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading posts",
        description: "Please try refreshing the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          content,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post has been published."
      });

      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error updating like",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleRetweet = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_retweeted) {
        await supabase
          .from('retweets')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('retweets')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error toggling retweet:', error);
      toast({
        title: "Error updating retweet",
        description: "Please try again.",
        variant: "destructive"
      });
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
