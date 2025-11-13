import { useState, useEffect, useRef, useCallback } from 'react';
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
  views_count: number;
  trending_score: number;
  image_urls?: string[];
  audio_url?: string;
  posted_as_page?: string;
  sponsored_post_id?: string;
  quoted_post_id?: string;
  user_liked?: boolean;
  user_retweeted?: boolean;
  user_pinned?: boolean;
  quoted_post?: Post | null;
  metadata?: any;
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

// Simple cache to prevent duplicate requests
const postsCache = new Map<string, { data: Post[], timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const fetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPosts = useCallback(async (sortBy: 'recent' | 'trending' | 'professional' = 'recent') => {
    // Check cache first
    const cacheKey = `${sortBy}_${user?.id || 'anon'}`;
    const cached = postsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached posts');
      setPosts(cached.data);
      setLoading(false);
      return;
    }

    // Prevent duplicate simultaneous fetches
    if (fetchingRef.current) {
      console.log('Fetch already in progress, skipping');
      return;
    }

    fetchingRef.current = true;

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      console.log('Fetching posts with filter:', sortBy);
      
      // Build the query with proper sorting and filtering - limit to 50 posts
      let query = supabase
        .from('posts')
        .select('*')
        .limit(50);

      // Filter by professional accounts if requested
      if (sortBy === 'professional') {
        query = query.not('posted_as_page', 'is', null);
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'trending') {
        query = query.order('trending_score', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }

      console.log('Posts fetched:', postsData?.length || 0);

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setLoading(false);
        fetchingRef.current = false;
        return;
      }

      // Get unique user IDs and page IDs
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const pageIds = [...new Set(postsData
        .filter(post => post.posted_as_page)
        .map(post => post.posted_as_page!))];

      // Fetch profiles and business pages in parallel
      const [profilesResult, businessPagesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, is_verified, verification_level, premium_tier')
          .in('id', userIds),
        pageIds.length > 0
          ? supabase
              .from('business_pages')
              .select('id, page_name, page_avatar_url, page_type, is_verified')
              .in('id', pageIds)
          : Promise.resolve({ data: [], error: null })
      ]);

      if (profilesResult.error) {
        console.error('Error fetching profiles:', profilesResult.error);
      }

      if (businessPagesResult.error) {
        console.error('Error fetching business pages:', businessPagesResult.error);
      }

      // Create lookup maps
      const profilesMap = new Map<string, any>(profilesResult.data?.map(profile => [profile.id, profile] as [string, any]) || []);
      const businessPagesMap = new Map<string, any>(businessPagesResult.data?.map(page => [page.id, page] as [string, any]) || []);

      // Optimize: Fetch all user interactions in parallel instead of per-post
      let likesMap = new Map();
      let retweetsMap = new Map();
      let pinnedMap = new Map();

      if (user) {
        const postIds = postsData.map(p => p.id);
        
        // Fetch all likes, retweets, and pinned posts in parallel
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

        likesMap = new Map(likesData.data?.map(l => [l.post_id, true]) || []);
        retweetsMap = new Map(retweetsData.data?.map(r => [r.post_id, true]) || []);
        pinnedMap = new Map(pinnedData.data?.map(p => [p.post_id, true]) || []);
      }

      // Add user interaction flags
      const postsWithUserData: Post[] = postsData.map((post): Post => ({
        ...post,
        views_count: post.views_count || 0,
        trending_score: post.trending_score || 0,
        profiles: profilesMap.get(post.user_id) || null,
        business_pages: post.posted_as_page ? (businessPagesMap.get(post.posted_as_page) || null) : null,
        user_liked: likesMap.get(post.id) || false,
        user_retweeted: retweetsMap.get(post.id) || false,
        user_pinned: pinnedMap.get(post.id) || false,
        quoted_post: null
      }));

      // Fetch quoted posts for posts that have quoted_post_id
      const quotedPostIds = postsData
        .filter(post => post.quoted_post_id)
        .map(post => post.quoted_post_id);
      
      let quotedPostsMap = new Map();
      if (quotedPostIds.length > 0) {
        const { data: quotedPostsData } = await supabase
          .from('posts')
          .select('*')
          .in('id', quotedPostIds);

        if (quotedPostsData) {
          // Get profiles for quoted posts
          const quotedUserIds = [...new Set(quotedPostsData.map(post => post.user_id))];
          const { data: quotedProfilesData } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url, is_verified, verification_level')
            .in('id', quotedUserIds);

          const quotedProfilesMap = new Map(quotedProfilesData?.map(profile => [profile.id, profile]) || []);

          // Get business pages for quoted posts
          const quotedPageIds = quotedPostsData
            .filter(post => post.posted_as_page)
            .map(post => post.posted_as_page);
          
          let quotedBusinessPagesData = [];
          if (quotedPageIds.length > 0) {
            const { data: pagesData } = await supabase
              .from('business_pages')
              .select('id, page_name, page_avatar_url, page_type, is_verified')
              .in('id', quotedPageIds);
            quotedBusinessPagesData = pagesData || [];
          }

          const quotedBusinessPagesMap = new Map(quotedBusinessPagesData.map(page => [page.id, page]));

          // Create quoted posts with full data
          quotedPostsData.forEach(quotedPost => {
            quotedPostsMap.set(quotedPost.id, {
              ...quotedPost,
              profiles: quotedProfilesMap.get(quotedPost.user_id) || null,
              business_pages: quotedPost.posted_as_page ? quotedBusinessPagesMap.get(quotedPost.posted_as_page) || null : null
            });
          });
        }
      }

      // Add quoted post data to posts
      const postsWithQuotedData: Post[] = postsWithUserData.map(post => ({
        ...post,
        quoted_post: post.quoted_post_id ? (quotedPostsMap.get(post.quoted_post_id) || null) : null
      }));

      console.log('Posts with user data:', postsWithQuotedData.length);
      setPosts(postsWithQuotedData);

      // Cache the results
      postsCache.set(cacheKey, { 
        data: postsWithQuotedData, 
        timestamp: Date.now() 
      });
    } catch (error: any) {
      // Ignore aborted requests
      if (error?.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      console.error('Error fetching posts:', error);
      toast({
        title: "Error fetching posts",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user, toast]);

  const trackPostView = async (postId: string) => {
    try {
      // Insert view record
      await supabase
        .from('post_views')
        .insert({
          post_id: postId,
          viewer_id: user?.id || null,
          viewed_at: new Date().toISOString()
        });

      // Update local state to reflect the view
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { ...p, views_count: p.views_count + 1 }
            : p
        )
      );

      // Update trending scores periodically
      await supabase.rpc('update_trending_scores');
    } catch (error) {
      // Silently handle view tracking errors to not disrupt user experience
      console.error('Error tracking post view:', error);
    }
  };

  const createPost = async (
    content: string, 
    imageUrls: string[] = [], 
    selectedAccount: 'personal' | string = 'personal',
    audioUrl?: string,
    quotedPostId?: string
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
      // Play post sound effect
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyAzvDbjjYIGWm98OOYTgwOUKvo862mWxsNNYnZ8cmCKwUuf8rx56JPC');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors if audio fails

      const postData: any = {
        content,
        user_id: user.id,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        audio_url: audioUrl || null,
        posted_as_page: selectedAccount !== 'personal' ? selectedAccount : null,
        quoted_post_id: quotedPostId || null
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select('*')
        .single();

      if (error) throw error;

      // Extract mentions from content and create notifications
      const mentionRegex = /@([\w]+)/g;
      const mentions = Array.from(content.matchAll(mentionRegex), m => m[1]);
      
      if (mentions.length > 0) {
        // Get user IDs for mentioned usernames
        const { data: mentionedUsers } = await supabase
          .from('profiles')
          .select('id, username, display_name')
          .in('username', mentions);

        if (mentionedUsers && mentionedUsers.length > 0) {
          // Get current user's profile for notification message
          const { data: currentUserProfile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('id', user.id)
            .single();

          const displayName = currentUserProfile?.display_name || currentUserProfile?.username || 'Someone';

          // Create notifications and send emails for each mentioned user
          for (const mentionedUser of mentionedUsers) {
            // Skip if user mentions themselves
            if (mentionedUser.id === user.id) continue;

            // Create notification
            await supabase
              .from('notifications')
              .insert({
                user_id: mentionedUser.id,
                type: 'mention',
                message: `${displayName} mentioned you in a post`,
                actor_id: user.id,
                post_id: data.id
              });

            // Send email notification
            try {
              await supabase.functions.invoke('send-mention-notification', {
                body: {
                  to_user_id: mentionedUser.id,
                  from_user_name: displayName,
                  post_id: data.id,
                  post_preview: content.substring(0, 100)
                }
              });
            } catch (emailError) {
              console.error('Error sending mention email:', emailError);
              // Don't block post creation if email fails
            }
          }
        }
      }

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
        likes_count: data.likes_count || 0,
        retweets_count: data.retweets_count || 0,
        replies_count: data.replies_count || 0,
        views_count: data.views_count || 0,
        trending_score: data.trending_score || 0,
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

      const wasLiked = post.user_liked;
      
      // Optimistically update UI first
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                user_liked: !wasLiked,
                likes_count: Math.max(0, wasLiked ? p.likes_count - 1 : p.likes_count + 1)
              }
            : p
        )
      );

      if (wasLiked) {
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

      // Update trending scores
      await supabase.rpc('update_trending_scores');
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      const post = posts.find(p => p.id === postId);
      if (post) {
        setPosts(prevPosts => 
          prevPosts.map(p => 
            p.id === postId 
              ? { ...p, user_liked: !p.user_liked, likes_count: p.user_liked ? p.likes_count + 1 : p.likes_count - 1 }
              : p
          )
        );
      }
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

      const wasRetweeted = post.user_retweeted;
      
      // Optimistically update UI first
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                user_retweeted: !wasRetweeted,
                retweets_count: Math.max(0, wasRetweeted ? p.retweets_count - 1 : p.retweets_count + 1)
              }
            : p
        )
      );

      if (wasRetweeted) {
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

      // Update trending scores
      await supabase.rpc('update_trending_scores');
    } catch (error) {
      console.error('Error toggling retweet:', error);
      // Revert on error
      const post = posts.find(p => p.id === postId);
      if (post) {
        setPosts(prevPosts => 
          prevPosts.map(p => 
            p.id === postId 
              ? { ...p, user_retweeted: !p.user_retweeted, retweets_count: p.user_retweeted ? p.retweets_count + 1 : p.retweets_count - 1 }
              : p
          )
        );
      }
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
    
    // Listen for reply added events to update counts
    const handleReplyAdded = (event: CustomEvent) => {
      const { postId } = event.detail;
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { ...p, replies_count: p.replies_count + 1 }
            : p
        )
      );
    };

    window.addEventListener('replyAdded', handleReplyAdded as EventListener);
    
    return () => {
      window.removeEventListener('replyAdded', handleReplyAdded as EventListener);
    };
  }, []);

  return {
    posts,
    loading,
    createPost,
    toggleLike,
    toggleRetweet,
    togglePin,
    deletePost,
    trackPostView,
    refetch: fetchPosts
  };
};
