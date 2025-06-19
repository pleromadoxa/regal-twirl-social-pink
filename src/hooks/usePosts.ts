import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  audio_url?: string;
  posted_as_page?: string;
  sponsored_post_id?: string;
  user_liked?: boolean;
  user_retweeted?: boolean;
  user_pinned?: boolean;
  profiles?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    is_verified: boolean;
    verification_level: string;
    premium_tier?: string;
  } | null;
  business_pages?: {
    id: string;
    page_name: string;
    page_avatar_url: string;
    page_type: string;
    is_verified: boolean;
  } | null;
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
            id,
            username,
            display_name,
            avatar_url,
            is_verified,
            verification_level,
            premium_tier
          ),
          business_pages:posted_as_page (
            id,
            page_name,
            page_avatar_url,
            page_type,
            is_verified
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add user interaction flags
      const postsWithUserData = await Promise.all((data || []).map(async (post) => {
        if (!user) return { 
          ...post, 
          user_liked: false, 
          user_retweeted: false, 
          user_pinned: false,
          profiles: post.profiles || null,
          business_pages: post.business_pages || null
        };

        // Check if user liked this post
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .single();

        // Check if user retweeted this post
        const { data: retweetData } = await supabase
          .from('retweets')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .single();

        // Check if user pinned this post
        const { data: pinnedData } = await supabase
          .from('pinned_posts')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .single();

        return {
          ...post,
          user_liked: !!likeData,
          user_retweeted: !!retweetData,
          user_pinned: !!pinnedData,
          profiles: post.profiles || null,
          business_pages: post.business_pages || null
        };
      }));

      setPosts(postsWithUserData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error fetching posts",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (
    content: string, 
    imageUrls: string[] = [], 
    selectedAccount: 'personal' | string = 'personal',
    audioUrl?: string
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post",
        variant: "destructive"
      });
      return;
    }

    try {
      const postData: any = {
        content,
        user_id: user.id,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        audio_url: audioUrl || null,
        posted_as_page: selectedAccount !== 'personal' ? selectedAccount : null
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            display_name,
            avatar_url,
            is_verified,
            verification_level,
            premium_tier
          ),
          business_pages:posted_as_page (
            id,
            page_name,
            page_avatar_url,
            page_type,
            is_verified
          )
        `)
        .single();

      if (error) throw error;

      // Add user interaction flags for new post
      const newPost: Post = {
        ...data,
        user_liked: false,
        user_retweeted: false,
        user_pinned: false,
        profiles: data.profiles || null,
        business_pages: data.business_pages || null
      };

      // Add the new post to the beginning of the posts array
      setPosts(prevPosts => [newPost, ...prevPosts]);

      toast({
        title: "Success",
        description: "Post created successfully",
      });

      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive"
      });
      throw error;
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_liked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
      }

      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                user_liked: !p.user_liked,
                likes_count: p.user_liked ? p.likes_count - 1 : p.likes_count + 1
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
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
        // Un-retweet
        await supabase
          .from('retweets')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Retweet
        await supabase
          .from('retweets')
          .insert({ post_id: postId, user_id: user.id });
      }

      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                user_retweeted: !p.user_retweeted,
                retweets_count: p.user_retweeted ? p.retweets_count - 1 : p.retweets_count + 1
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling retweet:', error);
      toast({
        title: "Error",
        description: "Failed to update retweet",
        variant: "destructive"
      });
    }
  };

  const togglePin = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_pinned) {
        // Unpin
        await supabase
          .from('pinned_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Pin
        await supabase
          .from('pinned_posts')
          .insert({ post_id: postId, user_id: user.id });
      }

      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { ...p, user_pinned: !p.user_pinned }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: "Error",
        description: "Failed to update pin",
        variant: "destructive"
      });
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      // Update local state
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    createPost,
    toggleLike,
    toggleRetweet,
    togglePin,
    deletePost,
    refetch: fetchPosts
  };
};
