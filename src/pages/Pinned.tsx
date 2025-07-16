import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import PostCard from '@/components/PostCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pin, Heart, MessageCircle, Repeat, Share } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const Pinned = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [pinnedPosts, setPinnedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPinnedPosts();
    }
  }, [user]);

  const fetchPinnedPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('pinned_posts')
        .select(`
          id,
          created_at,
          posts!inner(
            id,
            content,
            image_urls,
            audio_url,
            likes_count,
            replies_count,
            retweets_count,
            views_count,
            created_at,
            profiles!inner(
              id,
              username,
              display_name,
              avatar_url,
              is_verified
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPinnedPosts(data || []);
    } catch (error) {
      console.error('Error fetching pinned posts:', error);
      toast({
        title: "Error",
        description: "Failed to load pinned posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnpin = async (pinnedPostId: string) => {
    try {
      const { error } = await supabase
        .from('pinned_posts')
        .delete()
        .eq('id', pinnedPostId);

      if (error) throw error;

      setPinnedPosts(prev => prev.filter(p => p.id !== pinnedPostId));
      toast({
        title: "Unpinned",
        description: "Post removed from your pinned collection"
      });
    } catch (error) {
      console.error('Error unpinning post:', error);
      toast({
        title: "Error",
        description: "Failed to unpin post",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-white/80 backdrop-blur-xl border-purple-200">
          <CardContent className="text-center">
            <Pin className="w-16 h-16 mx-auto text-purple-400 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Pinned Posts</h1>
            <p className="text-gray-600 dark:text-gray-400">Please sign in to view your pinned posts</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className={`flex-1 ${isMobile ? 'ml-0' : 'ml-80'} mr-96 flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className={`flex-1 ${isMobile ? 'ml-0' : 'ml-80'} mr-96 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl`}>
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
          <div className="flex items-center gap-3">
            <Pin className="w-6 h-6 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Pinned Posts
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {pinnedPosts.length} {pinnedPosts.length === 1 ? 'post' : 'posts'} saved for later
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {pinnedPosts.length === 0 ? (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50">
              <CardContent className="p-12 text-center">
                <Pin className="w-16 h-16 mx-auto text-purple-400 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Pinned Posts Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Start pinning posts you want to save for later. Look for the pin icon on posts you want to bookmark.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                >
                  Explore Posts
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {pinnedPosts.map((pinnedPost) => (
                <div key={pinnedPost.id} className="relative">
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 shadow-lg">
                    <CardContent className="p-6">
                      {/* Pin indicator */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                          <Pin className="w-4 h-4" />
                          <span>Pinned on {new Date(pinnedPost.created_at).toLocaleDateString()}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnpin(pinnedPost.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Unpin
                        </Button>
                      </div>

                      {/* Post content */}
                      <div className="space-y-4">
                        {/* Author */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                            {pinnedPost.posts.profiles?.avatar_url ? (
                              <img 
                                src={pinnedPost.posts.profiles.avatar_url} 
                                alt="" 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              pinnedPost.posts.profiles?.display_name?.[0] || 
                              pinnedPost.posts.profiles?.username?.[0] || 
                              '?'
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {pinnedPost.posts.profiles?.display_name || pinnedPost.posts.profiles?.username}
                              </span>
                              {pinnedPost.posts.profiles?.is_verified && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              @{pinnedPost.posts.profiles?.username}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                          {pinnedPost.posts.content}
                        </p>

                        {/* Images */}
                        {pinnedPost.posts.image_urls && pinnedPost.posts.image_urls.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {pinnedPost.posts.image_urls.map((url: string, index: number) => (
                              <img
                                key={index}
                                src={url}
                                alt=""
                                className="w-full h-64 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}

                        {/* Audio */}
                        {pinnedPost.posts.audio_url && (
                          <audio controls className="w-full">
                            <source src={pinnedPost.posts.audio_url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-purple-200/50 dark:border-purple-800/50">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{pinnedPost.posts.likes_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{pinnedPost.posts.replies_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Repeat className="w-4 h-4" />
                            <span>{pinnedPost.posts.retweets_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share className="w-4 h-4" />
                            <span>{pinnedPost.posts.views_count}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Pinned;