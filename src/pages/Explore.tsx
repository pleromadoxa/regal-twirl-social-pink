
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, Users, Hash, Image, Video, Music, Flame, Star, Crown } from 'lucide-react';
import UserSearch from '@/components/UserSearch';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import TrendingHashtags from '@/components/TrendingHashtags';
import SponsoredPostsWidget from '@/components/SponsoredPostsWidget';
import BoostedPostsSection from '@/components/BoostedPostsSection';
import PostsList from '@/components/PostsList';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePosts } from '@/hooks/usePosts';
import { supabase } from '@/integrations/supabase/client';
import MobileBottomNav from '@/components/MobileBottomNav';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [featuredCreators, setFeaturedCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const { posts } = usePosts();

  useEffect(() => {
    fetchTrendingContent();
    fetchFeaturedCreators();
  }, [activeTab]);

  const fetchTrendingContent = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
        .order('trending_score', { ascending: false })
        .limit(20);

      if (activeTab === 'images') {
        query = query.not('image_urls', 'is', null);
      } else if (activeTab === 'videos') {
        query = query.not('video_url', 'is', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTrendingPosts(data || []);
    } catch (error) {
      console.error('Error fetching trending content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedCreators = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_verified', true)
        .order('followers_count', { ascending: false })
        .limit(6);

      if (error) throw error;
      setFeaturedCreators(data || []);
    } catch (error) {
      console.error('Error fetching featured creators:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className={`flex-1 ${isMobile ? 'px-4 pb-20' : 'ml-80'} transition-all duration-300`}>
        <div className="max-w-6xl mx-auto p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Explore Regal Network
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover amazing people, trending content, and new communities
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for users, topics, hashtags, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
            />
          </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-3 lg:p-4 text-center">
                  <Flame className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2" />
                  <p className="text-lg lg:text-2xl font-bold">2.4k</p>
                  <p className="text-xs lg:text-sm opacity-90">Trending Posts</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">125k</p>
                <p className="text-sm opacity-90">Active Users</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-4 text-center">
                <Hash className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">850</p>
                <p className="text-sm opacity-90">Trending Tags</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">45</p>
                <p className="text-sm opacity-90">Featured Creators</p>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                People
              </TabsTrigger>
              <TabsTrigger value="hashtags" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Topics
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Photos
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Videos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Featured Creators */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      Featured Creators
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {featuredCreators.slice(0, 4).map((creator) => (
                        <div key={creator.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                          <img 
                            src={creator.avatar_url || '/placeholder.svg'}
                            alt={creator.display_name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-sm">{creator.display_name}</span>
                              {creator.is_verified && <Crown className="w-3 h-3 text-blue-500" />}
                            </div>
                            <p className="text-xs text-gray-500">@{creator.username}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {creator.followers_count} followers
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Posts */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      Trending Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-16 bg-purple-200 dark:bg-purple-700 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                    <div className="space-y-4">
                        {trendingPosts.slice(0, 5).map((post) => (
                          <div 
                            key={post.id} 
                            className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                            onClick={() => window.location.href = `/profile/${post.profiles?.username}`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-purple-600">
                                @{post.profiles?.username}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {post.likes_count} likes
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                              {post.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Boosted Posts from Professional/Business Pages */}
              <BoostedPostsSection />

              {/* Sponsored Posts Widget */}
              <SponsoredPostsWidget />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50">
                <CardHeader>
                  <CardTitle>Search Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserSearch searchQuery={searchQuery} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hashtags" className="space-y-6">
              <TrendingHashtags />
            </TabsContent>

            <TabsContent value="images" className="space-y-6">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5 text-purple-600" />
                    Trending Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-square bg-purple-200 dark:bg-purple-700 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {trendingPosts
                        .filter(post => post.image_urls && post.image_urls.length > 0)
                        .slice(0, 9)
                        .map((post) => (
                          <div key={post.id} className="aspect-square rounded-lg overflow-hidden group cursor-pointer">
                            <img 
                              src={post.image_urls[0]} 
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="space-y-6">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-600" />
                    Trending Videos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-video bg-purple-200 dark:bg-purple-700 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {trendingPosts
                        .filter(post => post.video_url)
                        .slice(0, 8)
                        .map((post) => (
                          <div key={post.id} className="aspect-video rounded-lg overflow-hidden group cursor-pointer relative">
                            <video
                              src={post.video_url}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              muted
                              loop
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => e.currentTarget.pause()}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white text-sm font-medium">
                                  @{post.profiles?.username}
                                </span>
                                <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                                  {post.likes_count} likes
                                </Badge>
                              </div>
                              <p className="text-white text-xs line-clamp-2">
                                {post.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      {trendingPosts.filter(post => post.video_url).length === 0 && (
                        <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                          <Video className="w-12 h-12 mx-auto mb-4" />
                          <p>No trending videos at the moment</p>
                          <p className="text-sm">Check out our Reels section for video content</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Explore;
