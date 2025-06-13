
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Hash, 
  TrendingUp, 
  Users, 
  Calendar,
  Heart,
  MessageCircle,
  Repeat2,
  Share
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import UserLink from '@/components/UserLink';
import { usePosts } from '@/hooks/usePosts';
import PostsList from '@/components/PostsList';

const Hashtag = () => {
  const { hashtag } = useParams();
  const { posts, loading } = usePosts();
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    recentGrowth: '+15%',
    topContributors: 0,
    trending: true
  });

  // Filter posts by hashtag
  useEffect(() => {
    if (!hashtag || !posts.length) {
      setFilteredPosts([]);
      setPopularPosts([]);
      return;
    }

    const hashtagPattern = new RegExp(`#${hashtag}\\b`, 'i');
    const filtered = posts.filter(post => 
      hashtagPattern.test(post.content)
    );

    // Sort by creation date for recent tab
    const recent = [...filtered].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Sort by engagement (likes + retweets + replies) for popular tab
    const popular = [...filtered].sort((a, b) => {
      const engagementA = (a.likes_count || 0) + (a.retweets_count || 0) + (a.replies_count || 0);
      const engagementB = (b.likes_count || 0) + (b.retweets_count || 0) + (b.replies_count || 0);
      return engagementB - engagementA;
    });

    setFilteredPosts(recent);
    setPopularPosts(popular);

    // Update stats
    const uniqueContributors = new Set(filtered.map(post => post.user_id)).size;
    setStats(prev => ({
      ...prev,
      totalPosts: filtered.length,
      topContributors: uniqueContributors
    }));
  }, [hashtag, posts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6 pl-80">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  #{hashtag}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {stats.totalPosts.toLocaleString()} posts
                </p>
              </div>
              {stats.trending && (
                <Badge className="bg-green-100 text-green-700 ml-auto">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.totalPosts.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Total Posts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.recentGrowth}</p>
                <p className="text-sm text-slate-500">Recent Growth</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.topContributors}</p>
                <p className="text-sm text-slate-500">Contributors</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Tabs defaultValue="recent" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="people">People</TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <Hash className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">
                      No posts found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-500">
                      Be the first to post about #{hashtag}!
                    </p>
                  </div>
                ) : (
                  <PostsList posts={filteredPosts} />
                )}
              </TabsContent>

              <TabsContent value="popular">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : popularPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">
                      No popular posts yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-500">
                      Posts with #{hashtag} will appear here when they gain popularity!
                    </p>
                  </div>
                ) : (
                  <PostsList posts={popularPosts} />
                )}
              </TabsContent>

              <TabsContent value="people">
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">People who post about #{hashtag} coming soon!</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default Hashtag;
