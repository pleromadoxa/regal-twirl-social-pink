
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import UserSearch from "@/components/UserSearch";
import TrendingWidget from "@/components/TrendingWidget";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Hash } from "lucide-react";
import { Search as SearchIcon } from "lucide-react";
import PostCard from "@/components/PostCard";
import ThreadUI from "@/components/ThreadUI";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Post } from "@/hooks/usePosts";

const Search = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    posts: Post[];
    discussions: any[];
  }>({ posts: [], discussions: [] });
  const [loading, setLoading] = useState(false);

  // Check if we have a hashtag in the URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hashtag = params.get('hashtag');
    if (hashtag) {
      setSearchQuery(`#${hashtag}`);
      performSearch(`#${hashtag}`);
    }
  }, [location.search]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ posts: [], discussions: [] });
      return;
    }

    setLoading(true);
    try {
      // Search posts
      const { data: postsData, error: postsError } = await supabase
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
          )
        `)
        .or(`content.ilike.%${query}%,content.ilike.%${query.replace('#', '')}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;

      // Search community discussions
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('community_discussions')
        .select(`
          *,
          profiles!community_discussions_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (discussionsError) throw discussionsError;

      // Transform posts data
      const transformedPosts: Post[] = (postsData || []).map(post => ({
        ...post,
        views_count: post.views_count || 0,
        trending_score: post.trending_score || 0,
        user_liked: false,
        user_retweeted: false,
        user_pinned: false,
        profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
      }));

      setSearchResults({
        posts: transformedPosts,
        discussions: discussionsData || []
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    performSearch(value);
  };

  const handleHashtagClick = (hashtag: string) => {
    navigate(`/search?hashtag=${hashtag.replace('#', '')}`);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <main className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'lg:mr-96'}`}>
        <div className="max-w-2xl mx-auto p-4">
          <div className="mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search posts, discussions, hashtags..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 bg-white/80 dark:bg-slate-800/80"
              />
            </div>
          </div>
          
          {searchQuery ? (
            <div className="space-y-6">
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="discussions">Discussions</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>
                
                <TabsContent value="posts" className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-slate-500">Searching posts...</p>
                    </div>
                  ) : searchResults.posts.length > 0 ? (
                    searchResults.posts.map((post) => (
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
                        onLike={() => {}}
                        onRetweet={() => {}}
                        onPin={() => {}}
                        onDelete={() => {}}
                        onShare={() => {}}
                        onTrackView={() => {}}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Hash className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-500">No posts found for "{searchQuery}"</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="discussions" className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-slate-500">Searching discussions...</p>
                    </div>
                  ) : searchResults.discussions.length > 0 ? (
                    <ThreadUI />
                  ) : (
                    <div className="text-center py-8">
                      <Hash className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-500">No discussions found for "{searchQuery}"</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="users" className="space-y-4">
                  <UserSearch 
                    searchQuery={searchQuery}
                    showMessageButton={true}
                    onStartConversation={(userId) => {
                      navigate(`/messages?user=${userId}`);
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Trending Topics */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Trending in Faith
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div 
                    className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                    onClick={() => handleHashtagClick('#PraiseReport')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-orange-500 text-white">Testimony</Badge>
                      <span className="text-green-600 text-sm font-medium">+32%</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">#PraiseReport</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">15.2K Posts</p>
                    </div>
                  </div>

                  <div 
                    className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                    onClick={() => handleHashtagClick('#PrayerRequest')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-green-600 text-white">Prayer</Badge>
                      <span className="text-green-600 text-sm font-medium">+18%</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-purple-600">#PrayerRequest</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">28.5K Posts</p>
                    </div>
                  </div>

                  <div 
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    onClick={() => handleHashtagClick('#DailyBread')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-600 text-white">Devotion</Badge>
                      <span className="text-green-600 text-sm font-medium">+25%</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">#DailyBread</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">12.8K Posts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Search;
