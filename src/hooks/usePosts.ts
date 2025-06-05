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
  user_pinned?: boolean;
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
      
      // First, get all posts
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
        .select('id, username, display_name, avatar_url, is_verified')
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
          profiles: profilesMap.get(post.user_id) || {
            username: 'unknown',
            display_name: 'Unknown User',
            avatar_url: '',
            is_verified: false
          }
        }));

        setPosts(enrichedPosts);
      } else {
        const enrichedPosts: Post[] = postsData.map(post => ({
          ...post,
          likes_count: post.likes_count || 0,
          retweets_count: post.retweets_count || 0,
          replies_count: post.replies_count || 0,
          profiles: profilesMap.get(post.user_id) || {
            username: 'unknown',
            display_name: 'Unknown User',
            avatar_url: '',
            is_verified: false
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

      // Remove post from local state
      setPosts(posts.filter(p => p.id !== postId));
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

      // Update local state
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
  }, [user]);

  return {
    posts,
    loading,
    createPost: async (content: string) => {
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
    },
    deletePost: async (postId: string) => {
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

        // Remove post from local state
        setPosts(posts.filter(p => p.id !== postId));
      } catch (error) {
        console.error('Error in deletePost:', error);
        toast({
          title: "Something went wrong",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    },
    toggleLike: async (postId: string) => {
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
    },
    toggleRetweet: async (postId: string) => {
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
    },
    togglePin,
    refetch: fetchPosts
  };
};
