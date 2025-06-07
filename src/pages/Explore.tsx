
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SidebarNav from "@/components/SidebarNav";
import UserSearch from "@/components/UserSearch";
import TrendingWidget from "@/components/TrendingWidget";
import { useFollow } from "@/hooks/useFollow";
import { fetchRandomVerse } from "@/services/bibleService";
import { Search, TrendingUp, Users, Crown, Video, Heart, MessageCircle, Repeat2, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  followers_count: number;
  is_verified: boolean;
  bio: string;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  retweets_count: number;
  replies_count: number;
  image_urls: string[];
  user_id: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
    is_verified: boolean;
    followers_count: number;
  };
}

interface BibleVerse {
  reference: string;
  text: string;
  translation: string;
}

const Explore = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { followUser, loading: followLoading } = useFollow();
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [videoPosts, setVideoPosts] = useState<Post[]>([]);
  const [dailyVerse, setDailyVerse] = useState<BibleVerse | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingVerse, setLoadingVerse] = useState(true);
  const [trendingOpen, setTrendingOpen] = useState(true);
  const [mediaOpen, setMediaOpen] = useState(true);
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSuggestedUsers();
      fetchTrendingPosts();
      fetchVideoPosts();
      fetchDailyVerse();
    }
  }, [user]);

  const fetchDailyVerse = async () => {
    try {
      setLoadingVerse(true);
      const verse = await fetchRandomVerse();
      setDailyVerse(verse);
    } catch (error) {
      console.error('Error fetching daily verse:', error);
    } finally {
      setLoadingVerse(false);
    }
  };

  const fetchSuggestedUsers = async () => {
    if (!user) return;

    try {
      setLoadingUsers(true);
      
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = following?.map(f => f.following_id) || [];
      const excludeIds = [...followingIds, user.id];
      
      let query = supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, followers_count, is_verified, bio')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .limit(20);

      const { data: allUsers, error } = await query;

      if (error) throw error;

      const shuffledUsers = allUsers?.sort(() => Math.random() - 0.5).slice(0, 5) || [];
      setSuggestedUsers(shuffledUsers);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTrendingPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          likes_count,
          retweets_count,
          replies_count,
          image_urls,
          user_id
        `)
        .gt('likes_count', 10)
        .order('likes_count', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(data?.map(post => post.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_verified, followers_count')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

      const enrichedPosts = data?.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || {
          username: 'unknown',
          display_name: 'Unknown User',
          avatar_url: '',
          is_verified: false,
          followers_count: 0
        }
      })) || [];

      setTrendingPosts(enrichedPosts);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    }
  };

  const fetchVideoPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          likes_count,
          retweets_count,
          replies_count,
          image_urls,
          user_id
        `)
        .not('image_urls', 'is', null)
        .gt('array_length(image_urls, 1)', 0)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(data?.map(post => post.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_verified, followers_count')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

      const enrichedPosts = data?.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || {
          username: 'unknown',
          display_name: 'Unknown User',
          avatar_url: '',
          is_verified: false,
          followers_count: 0
        }
      })) || [];

      setVideoPosts(enrichedPosts);
    } catch (error) {
      console.error('Error fetching video posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleHashtagClick = (hashtag: string) => {
    navigate(`/hashtag/${hashtag.replace('#', '')}`);
  };

  const handleFollowUser = async (userId: string) => {
    const success = await followUser(userId);
    if (success) {
      setSuggestedUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const getVerifiedStatus = (user: User) => {
    if (!user) return false;
    
    if (user.username === 'pleromadoxa') {
      return true;
    }
    
    if (user.is_verified) {
      return true;
    }
    
    if (user.followers_count && user.followers_count >= 100) {
      return true;
    }
    
    return false;
  };

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="bg-white/80 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => navigate(`/profile/${post.user_id}`)}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.profiles?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm">
              {post.profiles?.display_name?.[0] || post.profiles?.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                {post.profiles?.display_name || post.profiles?.username}
              </span>
              {getVerifiedStatus(post.profiles as any) && (
                <Crown className="w-3 h-3 text-blue-500" />
              )}
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-sm mb-2 line-clamp-2">
              {post.content}
            </p>
            {post.image_urls && post.image_urls.length > 0 && (
              <div className="grid grid-cols-1 gap-2 mb-2">
                {post.image_urls.slice(0, 2).map((url, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={url} 
                      alt="" 
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
                {post.image_urls.length > 2 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    +{post.image_urls.length - 2} more
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{post.likes_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{post.replies_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Repeat2 className="w-3 h-3" />
                <span>{post.retweets_count}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3 mb-6">
              <Search className="w-8 h-8 text-purple-600" />
              Explore
            </h1>
            <UserSearch />
          </div>

          <div className="p-6">
            <div className="grid gap-6">
              {/* Daily Bible Verse */}
              <Card className="bg-white/80 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                    Daily Verse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingVerse ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  ) : dailyVerse ? (
                    <div className="text-center">
                      <p className="text-slate-700 dark:text-slate-300 mb-3 italic text-lg leading-relaxed">
                        "{dailyVerse.text}"
                      </p>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold">
                        {dailyVerse.reference} ({dailyVerse.translation})
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 dark:text-slate-400">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Daily verse not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trending Posts */}
              <Collapsible open={trendingOpen} onOpenChange={setTrendingOpen}>
                <Card className="bg-white/80 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-700">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-3 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                          Trending Posts
                        </div>
                        {trendingOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      {loadingPosts ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {trendingPosts.slice(0, 4).map((post) => (
                            <PostCard key={post.id} post={post} />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Media Posts */}
              <Collapsible open={mediaOpen} onOpenChange={setMediaOpen}>
                <Card className="bg-white/80 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-700">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-3 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="w-6 h-6 text-purple-600" />
                          Latest Media Posts
                        </div>
                        {mediaOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      {loadingPosts ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {videoPosts.slice(0, 6).map((post) => (
                            <PostCard key={post.id} post={post} />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Trending Section */}
              <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  What's Trending
                </h2>
                <TrendingWidget onHashtagClick={handleHashtagClick} />
              </div>

              {/* Who to Follow */}
              <Collapsible open={suggestionsOpen} onOpenChange={setSuggestionsOpen}>
                <Card className="bg-white/80 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-700">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-3 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-6 h-6 text-purple-600" />
                          Who to Follow
                        </div>
                        {suggestionsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      {loadingUsers ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-3 animate-pulse">
                              <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : suggestedUsers.length > 0 ? (
                        <div className="space-y-4">
                          {suggestedUsers.map((suggestedUser) => {
                            const isVerified = getVerifiedStatus(suggestedUser);
                            return (
                              <div key={suggestedUser.id} className="flex items-center justify-between p-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors">
                                <div className="flex items-center space-x-3 flex-1 cursor-pointer" onClick={() => navigate(`/profile/${suggestedUser.id}`)}>
                                  <Avatar className="w-12 h-12">
                                    <AvatarImage src={suggestedUser.avatar_url || undefined} />
                                    <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                                      {suggestedUser.display_name?.[0] || suggestedUser.username?.[0] || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                        {suggestedUser.display_name || suggestedUser.username}
                                      </p>
                                      {isVerified && (
                                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 px-1.5 py-0.5">
                                          <Crown className="w-3 h-3" />
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                      @{suggestedUser.username}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-500">
                                      {suggestedUser.followers_count || 0} followers
                                    </p>
                                    {suggestedUser.bio && (
                                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-1">
                                        {suggestedUser.bio}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handleFollowUser(suggestedUser.id)}
                                  disabled={followLoading}
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
                                >
                                  {followLoading ? 'Following...' : 'Follow'}
                                </Button>
                              </div>
                            );
                          })}
                          <Button
                            variant="outline"
                            className="w-full rounded-xl border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
                            onClick={() => fetchSuggestedUsers()}
                          >
                            Refresh suggestions
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-purple-400" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400">
                            No new users to follow
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>
          </div>
        </main>

        <aside className="w-80 p-6">
          <TrendingWidget onHashtagClick={handleHashtagClick} />
        </aside>
      </div>
    </div>
  );
};

export default Explore;
