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
      console.log('Fetching posts...');
      
      // First get all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }

      console.log('Posts fetched:', postsData?.length || 0);

      if (!postsData) {
        setPosts([]);
        return;
      }

      // Get profiles for all unique user_ids
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_verified, verification_level, premium_tier')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Get business pages for posts that have posted_as_page
      const pageIds = postsData
        .filter(post => post.posted_as_page)
        .map(post => post.posted_as_page);
      
      let businessPagesData = [];
      if (pageIds.length > 0) {
        const { data: pagesData, error: pagesError } = await supabase
          .from('business_pages')
          .select('id, page_name, page_avatar_url, page_type, is_verified')
          .in('id', pageIds);
        
        if (pagesError) {
          console.error('Error fetching business pages:', pagesError);
        } else {
          businessPagesData = pagesData || [];
        }
      }

      // Create lookup maps
      const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);
      const businessPagesMap = new Map(businessPagesData.map(page => [page.id, page]));

      // Add user interaction flags
      const postsWithUserData = await Promise.all(postsData.map(async (post) => {
        const basePost = {
          ...post,
          profiles: profilesMap.get(post.user_id) || null,
          business_pages: post.posted_as_page ? businessPagesMap.get(post.posted_as_page) || null : null,
          user_liked: false,
          user_retweeted: false,
          user_pinned: false
        };

        if (!user) return basePost;

        // Check if user liked this post
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle();

        // Check if user retweeted this post
        const { data: retweetData } = await supabase
          .from('retweets')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle();

        // Check if user pinned this post
        const { data: pinnedData } = await supabase
          .from('pinned_posts')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle();

        return {
          ...basePost,
          user_liked: !!likeData,
          user_retweeted: !!retweetData,
          user_pinned: !!pinnedData
        };
      }));

      console.log('Posts with user data:', postsWithUserData.length);
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
        .select('*')
        .single();

      if (error) throw error;

      // Get the user's profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_verified, verification_level, premium_tier')
        .eq('id', user.id)
        .maybeSingle();

      // Get business page data if needed
      let businessPageData = null;
      if (data.posted_as_page) {
        const { data: pageData } = await supabase
          .from('business_pages')
          .select('id, page_name, page_avatar_url, page_type, is_verified')
          .eq('id', data.posted_as_page)
          .maybeSingle();
        businessPageData = pageData;
      }

      // Add user interaction flags for new post
      const newPost: Post = {
        ...data,
        user_liked: false,
        user_retweeted: false,
        user_pinned: false,
        profiles: profileData || null,
        business_pages: businessPageData
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
