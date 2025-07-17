import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PostCard from '@/components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Hash, TrendingUp } from 'lucide-react';
import { Post } from '@/hooks/usePosts';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';

const Hashtag = () => {
  const { hashtag } = useParams<{ hashtag: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPosts: 0, todayPosts: 0 });

  useEffect(() => {
    if (hashtag) {
      fetchHashtagPosts();
      fetchHashtagStats();
    }
  }, [hashtag]);

  const fetchHashtagPosts = async () => {
    if (!hashtag) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            username, 
            display_name, 
            avatar_url,
            is_verified,
            verification_level,
            premium_tier
          ),
          business_pages (
            id,
            page_name,
            page_avatar_url,
            page_type,
            is_verified
          )
        `)
        .ilike('content', `%#${hashtag}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform the data to match the Post interface
      const transformedPosts: Post[] = (data || []).map(post => ({
        ...post,
        views_count: post.views_count || 0,
        trending_score: post.trending_score || 0,
        user_liked: false, // Will be updated below if user is logged in
        user_retweeted: false,
        user_pinned: false,
        // Fix: profiles should be a single object, not an array
        profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
        business_pages: post.business_pages || null
      }));

      // If user is logged in, check their interactions with these posts
      if (user && transformedPosts.length > 0) {
        const postIds = transformedPosts.map(p => p.id);

        // Check likes
        const { data: likesData } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        // Check retweets
        const { data: retweetsData } = await supabase
          .from('retweets')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        // Check pinned posts
        const { data: pinnedData } = await supabase
          .from('pinned_posts')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        const likedPostIds = new Set(likesData?.map(l => l.post_id) || []);
        const retweetedPostIds = new Set(retweetsData?.map(r => r.post_id) || []);
        const pinnedPostIds = new Set(pinnedData?.map(p => p.post_id) || []);

        // Update user interaction flags
        transformedPosts.forEach(post => {
          post.user_liked = likedPostIds.has(post.id);
          post.user_retweeted = retweetedPostIds.has(post.id);
          post.user_pinned = pinnedPostIds.has(post.id);
        });
      }

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching hashtag posts:', error);
      toast({
        title: "Error",
        description: "Failed to load hashtag posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHashtagStats = async () => {
    if (!hashtag) return;

    try {
      // Total posts with this hashtag
      const { count: totalCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .ilike('content', `%#${hashtag}%`);

      // Posts from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .ilike('content', `%#${hashtag}%`)
        .gte('created_at', today.toISOString());

      setStats({
        totalPosts: totalCount || 0,
        todayPosts: todayCount || 0
      });
    } catch (error) {
      console.error('Error fetching hashtag stats:', error);
    }
  };

  const handleLike = async (postId: string) => {
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
          .insert({ post_id: postId, user_id: user.id });
      }

      // Update local state
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            user_liked: !p.user_liked,
            likes_count: p.user_liked ? p.likes_count - 1 : p.likes_count + 1
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleRetweet = async (postId: string) => {
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
          .insert({ post_id: postId, user_id: user.id });
      }

      // Update local state
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            user_retweeted: !p.user_retweeted,
            retweets_count: p.user_retweeted ? p.retweets_count - 1 : p.retweets_count + 1
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error toggling retweet:', error);
    }
  };

  const handlePin = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_pinned) {
        await supabase
          .from('pinned_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('pinned_posts')
          .insert({ post_id: postId, user_id: user.id });
      }

      // Update local state
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            user_pinned: !p.user_pinned
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({
        title: "Success",
        description: "Post deleted successfully"
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

  const handleShare = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const shareUrl = `${window.location.origin}/post/${postId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post',
          text: post.content.substring(0, 100) + '...',
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Post link copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive"
        });
      }
    }
  };

  const handleTrackView = async (postId: string) => {
    try {
      await supabase
        .from('post_views')
        .insert({
          post_id: postId,
          viewer_id: user?.id || null
        });
    } catch (error) {
      // Silently handle view tracking errors
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-blue-900">
        <div className="flex">
          <SidebarNav />
          <main className="flex-1 lg:mr-96">
            <div className="max-w-2xl mx-auto p-4">
              <div className="mb-6">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
          <div className="hidden lg:block">
            <RightSidebar />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-blue-900">
      <div className="flex">
        <SidebarNav />
        <main className="flex-1 lg:mr-96">
          <div className="max-w-2xl mx-auto p-4">
            {/* Hashtag Header */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                  <Hash className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  #{hashtag}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{stats.totalPosts} posts</span>
                </div>
                <div>
                  <span>{stats.todayPosts} today</span>
                </div>
              </div>
            </div>

            {/* Posts */}
            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={{
                      id: post.id,
                      content: post.content,
                      image_urls: post.image_urls,
                      created_at: post.created_at,
                      likes_count: post.likes_count,
                      retweets_count: post.retweets_count,
                      replies_count: post.replies_count,
                      views_count: post.views_count,
                      user_id: post.user_id,
                      profiles: post.profiles ? {
                        id: post.profiles.id,
                        username: post.profiles.username,
                        display_name: post.profiles.display_name,
                        avatar_url: post.profiles.avatar_url,
                        is_verified: post.profiles.is_verified
                      } : undefined
                    }}
                    isLiked={post.user_liked}
                    isRetweeted={post.user_retweeted}
                    onLike={() => handleLike(post.id)}
                    onRetweet={() => handleRetweet(post.id)}
                    onPin={() => handlePin(post.id)}
                    onDelete={() => handleDelete(post.id)}
                    onShare={() => handleShare(post.id)}
                    onTrackView={() => handleTrackView(post.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hash className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No posts found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Be the first to post with #{hashtag}
                </p>
              </div>
            )}
          </div>
        </main>
        <div className="hidden lg:block">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default Hashtag;
