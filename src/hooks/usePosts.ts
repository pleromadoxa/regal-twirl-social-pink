
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface Post {
  id: string;
  content: string;
  image_urls?: string[] | null;
  audio_url?: string | null;
  user_id: string;
  likes_count: number;
  replies_count: number;
  retweets_count: number;
  created_at: string;
  updated_at: string;
  posted_as_page?: string | null;
  user_liked?: boolean;
  user_retweeted?: boolean;
  profiles?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    is_verified: boolean;
  };
  business_pages?: {
    id: string;
    page_name: string;
    avatar_url: string;
    is_verified: boolean;
  };
}

export const usePosts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading: postsLoading, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:profiles!posts_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          ),
          business_pages:business_pages!posts_posted_as_page_fkey (
            id,
            page_name,
            avatar_url,
            is_verified
          )
        `)
        .order('created_at', { ascending: false });

      const { data: posts, error } = await query;
      
      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      if (!user.user) {
        return posts || [];
      }

      // Check which posts the user has liked
      const postIds = posts?.map(post => post.id) || [];
      
      if (postIds.length > 0) {
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.user.id)
          .in('post_id', postIds);

        const likedPostIds = new Set(likes?.map(like => like.post_id) || []);

        // Check which posts the user has retweeted
        const { data: retweets } = await supabase
          .from('retweets')
          .select('post_id')
          .eq('user_id', user.user.id)
          .in('post_id', postIds);

        const retweetedPostIds = new Set(retweets?.map(retweet => retweet.post_id) || []);

        return posts?.map(post => ({
          ...post,
          user_liked: likedPostIds.has(post.id),
          user_retweeted: retweetedPostIds.has(post.id)
        })) || [];
      }

      return posts || [];
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async ({ 
      content, 
      imageUrls, 
      postedAsPage,
      audioUrl 
    }: { 
      content: string; 
      imageUrls?: string[]; 
      postedAsPage?: string;
      audioUrl?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          content,
          image_urls: imageUrls || null,
          audio_url: audioUrl || null,
          user_id: user.user.id,
          posted_as_page: postedAsPage === 'personal' ? null : postedAsPage
        })
        .select(`
          *,
          profiles:profiles!posts_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          ),
          business_pages:business_pages!posts_posted_as_page_fkey (
            id,
            page_name,
            avatar_url,
            is_verified
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newPost) => {
      // Add the new post to the beginning of the posts list
      queryClient.setQueryData(['posts'], (oldPosts: Post[] = []) => [newPost, ...oldPosts]);
      
      toast({
        title: "Post created successfully!",
        description: "Your post has been shared with your followers.",
      });
    },
    onError: (error) => {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const createPost = async (
    content: string, 
    imageUrls?: string[], 
    postedAsPage?: string,
    audioUrl?: string
  ) => {
    setIsLoading(true);
    try {
      await createPostMutation.mutateAsync({ content, imageUrls, postedAsPage, audioUrl });
    } finally {
      setIsLoading(false);
    }
  };

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', user.user.id)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.user.id);
        
        if (error) throw error;
        return { action: 'unlike' };
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.user.id });
        
        if (error) throw error;
        return { action: 'like' };
      }
    },
    onSuccess: (result, postId) => {
      queryClient.setQueryData(['posts'], (oldPosts: Post[] = []) =>
        oldPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                user_liked: result.action === 'like',
                likes_count: post.likes_count + (result.action === 'like' ? 1 : -1)
              }
            : post
        )
      );
    },
  });

  const retweetPostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Check if already retweeted
      const { data: existingRetweet } = await supabase
        .from('retweets')
        .select()
        .eq('post_id', postId)
        .eq('user_id', user.user.id)
        .single();

      if (existingRetweet) {
        // Unretweet
        const { error } = await supabase
          .from('retweets')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.user.id);
        
        if (error) throw error;
        return { action: 'unretweet' };
      } else {
        // Retweet
        const { error } = await supabase
          .from('retweets')
          .insert({ post_id: postId, user_id: user.user.id });
        
        if (error) throw error;
        return { action: 'retweet' };
      }
    },
    onSuccess: (result, postId) => {
      queryClient.setQueryData(['posts'], (oldPosts: Post[] = []) =>
        oldPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                user_retweeted: result.action === 'retweet',
                retweets_count: post.retweets_count + (result.action === 'retweet' ? 1 : -1)
              }
            : post
        )
      );
      
      toast({
        title: result.action === 'retweet' ? "Post retweeted!" : "Retweet removed",
        description: result.action === 'retweet' ? "You shared this post with your followers." : "Retweet has been removed.",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
    },
    onSuccess: (_, postId) => {
      queryClient.setQueryData(['posts'], (oldPosts: Post[] = []) =>
        oldPosts.filter(post => post.id !== postId)
      );
      
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });
    },
  });

  return {
    posts,
    isLoading: postsLoading || isLoading,
    createPost,
    likePost: likePostMutation.mutate,
    retweetPost: retweetPostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    refetch
  };
};
