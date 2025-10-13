import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CirclePost {
  id: string;
  circle_id: string;
  author_id: string;
  content: string;
  media_urls: string[];
  likes_count: number;
  comments_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const useCirclePosts = (circleId?: string) => {
  const [posts, setPosts] = useState<CirclePost[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPosts = async () => {
    if (!circleId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('circle_posts')
        .select('*')
        .eq('circle_id', circleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      if (data && data.length > 0) {
        const authorIds = [...new Set(data.map(post => post.author_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', authorIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        const postsWithProfiles = data.map(post => ({
          ...post,
          media_urls: Array.isArray(post.media_urls) ? post.media_urls : [],
          profiles: profileMap.get(post.author_id),
        }));
        
        setPosts(postsWithProfiles as any);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching circle posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load circle posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string, mediaUrls: string[] = []) => {
    if (!circleId) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('circle_posts')
        .insert({
          circle_id: circleId,
          author_id: user.id,
          content,
          media_urls: mediaUrls,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Post created successfully',
      });

      fetchPosts();
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
      return null;
    }
  };

  const likePost = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('circle_post_likes')
        .insert({ post_id: postId, user_id: user.id });

      if (error) throw error;
      fetchPosts();
    } catch (error: any) {
      if (error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error liking post:', error);
        toast({
          title: 'Error',
          description: 'Failed to like post',
          variant: 'destructive',
        });
      }
    }
  };

  const unlikePost = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('circle_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error unliking post:', error);
      toast({
        title: 'Error',
        description: 'Failed to unlike post',
        variant: 'destructive',
      });
    }
  };

  const updatePost = async (postId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('circle_posts')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Post updated successfully',
      });

      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update post',
        variant: 'destructive',
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('circle_posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });

      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (circleId) {
      fetchPosts();
    }
  }, [circleId]);

  return {
    posts,
    loading,
    createPost,
    likePost,
    unlikePost,
    updatePost,
    deletePost,
    refetch: fetchPosts,
  };
};
