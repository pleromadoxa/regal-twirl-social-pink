
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const usePostsData = (posts: any[], user: any, refetch?: () => void) => {
  const { toast } = useToast();
  const [retweetedBy, setRetweetedBy] = useState<{[key: string]: any}>({});
  const [retweetUsers, setRetweetUsers] = useState<{[key: string]: any[]}>({});
  const [newPostNotification, setNewPostNotification] = useState<string | null>(null);
  const [businessPages, setBusinessPages] = useState<{[key: string]: any}>({});
  const [sponsoredPosts, setSponsoredPosts] = useState<{[key: string]: any}>({});

  // Fetch sponsored post information
  useEffect(() => {
    const fetchSponsoredPosts = async () => {
      if (!posts || posts.length === 0) return;
      
      const postIds = posts
        .filter(post => post.sponsored_post_id)
        .map(post => post.sponsored_post_id)
        .filter(Boolean);
      
      if (postIds.length === 0) return;
      
      try {
        const { data: sponsoredData } = await supabase
          .from('sponsored_posts')
          .select(`
            id,
            post_id,
            business_page_id,
            sponsor_type,
            status,
            business_pages(
              id,
              page_name,
              page_type
            )
          `)
          .in('id', postIds);

        if (sponsoredData) {
          const sponsoredMap: {[key: string]: any} = {};
          sponsoredData.forEach(sponsored => {
            sponsoredMap[sponsored.post_id] = sponsored;
          });
          setSponsoredPosts(sponsoredMap);
        }
      } catch (error) {
        console.error('Error fetching sponsored posts:', error);
      }
    };

    fetchSponsoredPosts();
  }, [posts]);

  // Fetch business page information for posts made as professional accounts
  useEffect(() => {
    const fetchBusinessPages = async () => {
      if (!posts || posts.length === 0) return;
      
      const pageIds = posts
        .filter(post => post.posted_as_page)
        .map(post => post.posted_as_page)
        .filter(Boolean);
      
      if (pageIds.length === 0) return;
      
      try {
        const { data: pagesData } = await supabase
          .from('business_pages')
          .select('id, page_name, page_type, avatar_url, is_verified')
          .in('id', pageIds);

        if (pagesData) {
          const pagesMap: {[key: string]: any} = {};
          pagesData.forEach(page => {
            pagesMap[page.id] = page;
          });
          setBusinessPages(pagesMap);
        }
      } catch (error) {
        console.error('Error fetching business pages:', error);
      }
    };

    fetchBusinessPages();
  }, [posts]);

  // Real-time notification for new posts with auto-refresh
  useEffect(() => {
    if (!user || !posts) return;

    const channel = supabase
      .channel('new-posts-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      }, async (payload) => {
        const newPost = payload.new;
        
        if (newPost.user_id === user.id) {
          // If it's user's own post, refresh the feed immediately
          setTimeout(() => {
            if (refetch) refetch();
          }, 500);
          return;
        }

        // Fetch the author's profile for notification
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name')
          .eq('id', newPost.user_id)
          .maybeSingle();

        if (profile) {
          const authorName = profile.display_name || profile.username || 'Someone';
          setNewPostNotification(`${authorName} just posted!`);
          
          // Auto-hide notification and refresh after 3 seconds
          setTimeout(() => {
            setNewPostNotification(null);
            if (refetch) refetch();
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, posts, refetch]);

  // Enhanced retweet information fetching
  const fetchRetweetInfo = async () => {
    if (!posts || posts.length === 0 || !user) return;
    
    const retweetInfo: {[key: string]: any} = {};
    const retweetUsersMap: {[key: string]: any[]} = {};
    const postIds = posts.map(post => post.id);
    
    try {
      const { data: retweetsData } = await supabase
        .from('retweets')
        .select(`
          post_id,
          user_id,
          created_at,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .in('post_id', postIds)
        .order('created_at', { ascending: false });

      if (retweetsData) {
        retweetsData.forEach(retweet => {
          if (!retweetUsersMap[retweet.post_id]) {
            retweetUsersMap[retweet.post_id] = [];
          }
          
          if (retweet.profiles && typeof retweet.profiles === 'object') {
            const profileData = {
              username: (retweet.profiles as any).username,
              display_name: (retweet.profiles as any).display_name,
              avatar_url: (retweet.profiles as any).avatar_url
            };
            
            retweetUsersMap[retweet.post_id].push({
              ...profileData,
              user_id: retweet.user_id,
              created_at: retweet.created_at
            });

            if (retweet.user_id === user.id) {
              retweetInfo[retweet.post_id] = {
                retweetedBy: user,
                isCurrentUser: true
              };
            } else if (!retweetInfo[retweet.post_id]) {
              retweetInfo[retweet.post_id] = {
                retweetedBy: profileData,
                isCurrentUser: false
              };
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching retweet info:', error);
    }
    
    setRetweetedBy(retweetInfo);
    setRetweetUsers(retweetUsersMap);
  };

  // Fetch retweet information for posts
  useEffect(() => {
    fetchRetweetInfo();
  }, [posts, user]);

  const handleShare = async (postId: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post',
          url: `${window.location.origin}/post/${postId}`
        });
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        toast({
          title: "Link copied!",
          description: "Post link copied to clipboard"
        });
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  return {
    retweetedBy,
    retweetUsers,
    newPostNotification,
    businessPages,
    sponsoredPosts,
    fetchRetweetInfo,
    handleShare
  };
};
