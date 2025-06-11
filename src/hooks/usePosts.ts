
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_urls?: string[];
  created_at: string;
  updated_at: string;
  likes_count: number;
  retweets_count: number;
  replies_count: number;
  user_liked?: boolean;
  user_retweeted?: boolean;
  user_pinned?: boolean;
  posted_as_page?: string; // Add this field for professional account posts
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
    is_verified: boolean;
    premium_tier: string;
  };
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const enrichPostWithUserData = async (post: any, profilesMap: Map<string, any>) => {
    let userLiked = false;
    let userRetweeted = false;
    let userPinned = false;

    if (user) {
      // Check if user liked, retweeted, or pinned this post
      const [likesData, retweetsData, pinnedData] = await Promise.all([
        supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .eq('post_id', post.id),
        supabase
          .from('retweets')
          .select('post_id')
          .eq('user_id', user.id)
          .eq('post_id', post.id),
        supabase
          .from('pinned_posts')
          .select('post_id')
          .eq('user_id', user.id)
          .eq('post_id', post.id)
      ]);

      userLiked = (likesData.data?.length || 0) > 0;
      userRetweeted = (retweetsData.data?.length || 0) > 0;
      userPinned = (pinnedData.data?.length || 0) > 0;
    }

    return {
      ...post,
      user_liked: userLiked,
      user_retweeted: userRetweeted,
      user_pinned: userPinned,
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
    };
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // First, get all posts including the new image_urls column
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return;
      }

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Get all unique user IDs from posts
      const userIds = [...new Set(postsData.map(post => post.user_id))];

      // Fetch profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_verified, premium_tier')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create a map of user_id to profile for easy lookup
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.id, profile])
      );

      if (user) {
        // Get user likes, retweets, and pinned posts
        const postIds = postsData.map(post => post.id);
        
        const [likesData, retweetsData, pinnedData] = await Promise.all([
          supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds),
          supabase
            .from('retweets')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds),
          supabase
            .from('pinned_posts')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds)
        ]);

        const userLikedPosts = new Set(likesData.data?.map(like => like.post_id) || []);
        const userRetweetedPosts = new Set(retweetsData.data?.map(retweet => retweet.post_id) || []);
        const userPinnedPosts = new Set(pinnedData.data?.map(pinned => pinned.post_id) || []);

        const enrichedPosts: Post[] = postsData.map(post => ({
          ...post,
          user_liked: userLikedPosts.has(post.id),
          user_retweeted: userRetweetedPosts.has(post.id),
          user_pinned: userPinnedPosts.has(post.id),
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

        setPosts(enrichedPosts);
      } else {
        const enrichedPosts: Post[] = postsData.map(post => ({
          ...post,
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
        
        setPosts(enrichedPosts);
      }
    } catch (error) {
      console.error('Error in fetchPosts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle real-time new posts
  const handleNewPost = async (payload: any) => {
    console.log('New post received:', payload);
    const newPost = payload.new;
    
    // Fetch the profile for the new post author
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, is_verified, premium_tier')
      .eq('id', newPost.user_id)
      .single();

    const profilesMap = new Map();
    if (profileData) {
      profilesMap.set(profileData.id, profileData);
    }

    // Enrich the new post with user data
    const enrichedPost = await enrichPostWithUserData(newPost, profilesMap);
    
    // Add the new post to the beginning of the posts array
    setPosts(prevPosts => [enrichedPost, ...prevPosts]);
    
    // Show a toast notification for new posts (optional, only if not from current user)
    if (user && newPost.user_id !== user.id) {
      toast({
        title: "New post",
        description: `@${profileData?.username || 'someone'} just posted`,
        duration: 3000,
      });
    }
  };

  // Handle real-time post updates (likes, retweets, etc.)
  const handlePostUpdate = async (payload: any) => {
    console.log('Post updated:', payload);
    const updatedPost = payload.new;
    
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id 
          ? { ...post, ...updatedPost }
          : post
      )
    );
  };

  // Handle real-time post deletions
  const handlePostDelete = (payload: any) => {
    console.log('Post deleted:', payload);
    const deletedPostId = payload.old.id;
    
    setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
  };

  const createPost = async (content: string, imageUrls: string[] = [], selectedAccount: 'personal' | string = 'personal') => {
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
        user_id: user.id,
        content: content.trim(),
        image_urls: imageUrls.length > 0 ? imageUrls : null,
      };

      // Add professional account info if not posting as personal
      if (selectedAccount !== 'personal') {
        postData.posted_as_page = selectedAccount;
      }

      const { error } = await supabase
        .from('posts')
        .insert([postData]);

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

      // Note: We don't need to manually refresh posts here anymore since real-time will handle it
    } catch (error) {
      console.error('Error in createPost:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id); // Ensure users can only delete their own posts

      if (error) {
        console.error('Error deleting post:', error);
        toast({
          title: "Error deleting post",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully."
      });

      // Note: Real-time will handle removing the post from the list
    } catch (error) {
      console.error('Error in deletePost:', error);
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

      // Update local state immediately
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

      // Update local state immediately
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

  const togglePin = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to pin posts",
        variant: "destructive"
      });
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.user_pinned) {
        // Unpin the post
        await supabase
          .from('pinned_posts')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        toast({
          title: "Post unpinned",
          description: "Post removed from your pinned posts."
        });
      } else {
        // Pin the post
        await supabase
          .from('pinned_posts')
          .insert({
            user_id: user.id,
            post_id: postId
          });

        toast({
          title: "Post pinned",
          description: "Post added to your pinned posts."
        });
      }

      // Update local state immediately
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, user_pinned: !p.user_pinned }
          : p
      ));
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: "Error",
        description: "Failed to update pin status",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchPosts();

    // Create a unique channel name to avoid conflicts
    const channelName = `posts-realtime-${Date.now()}-${Math.random()}`;
    
    // Set up real-time subscription for posts
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      }, handleNewPost)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'posts'
      }, handlePostUpdate)
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'posts'
      }, handlePostDelete)
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up posts channel subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id]); // Only depend on user.id to prevent unnecessary re-subscriptions

  return {
    posts,
    loading,
    createPost,
    deletePost,
    toggleLike,
    toggleRetweet,
    togglePin,
    refetch: fetchPosts
  };
};
