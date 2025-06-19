
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
  profiles?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    is_verified: boolean;
    verification_level: string;
  };
  business_pages?: {
    id: string;
    page_name: string;
    page_avatar_url: string;
    page_type: string;
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
            verification_level
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

      setPosts(data || []);
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
            verification_level
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

      // Add the new post to the beginning of the posts array
      setPosts(prevPosts => [data, ...prevPosts]);

      toast({
        title: "Success",
        description: "Post created successfully",
      });

      return data;
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

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    createPost,
    refetch: fetchPosts
  };
};
