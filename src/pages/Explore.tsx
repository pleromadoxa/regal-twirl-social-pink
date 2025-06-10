
import { useState, useEffect } from "react";
import { Search, TrendingUp, Users, Video, Hash, Filter } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import UserSearch from "@/components/UserSearch";
import TrendingWidget from "@/components/TrendingWidget";
import ProfessionalUsersWidget from "@/components/ProfessionalUsersWidget";
import ReelsSection from "@/components/ReelsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  type: 'post' | 'user' | 'hashtag';
  content?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  hashtag?: string;
  post_count?: number;
  created_at?: string;
}

const Explore = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [activeTab, setActiveTab] = useState("trending");
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchFilter, setSearchFilter] = useState("all");
  const [isSearching, setIsSearching] = useState(false);

  const handleHashtagClick = (hashtag: string) => {
    navigate(`/hashtag/${encodeURIComponent(hashtag.replace('#', ''))}`);
  };

  const performSearch = async (query: string, filter: string = "all") => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results: SearchResult[] = [];

    try {
      // Search posts
      if (filter === "all" || filter === "posts") {
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            id,
            content,
            created_at,
            profiles:profiles!posts_user_id_fkey (
              username,
              display_name,
              avatar_url
            )
          `)
          .ilike('content', `%${query}%`)
          .order('created_at', { ascending: false })
          .limit(20);

        if (posts) {
          posts.forEach(post => {
            results.push({
              id: post.id,
              type: 'post',
              content: post.content,
              username: post.profiles?.username,
              display_name: post.profiles?.display_name,
              avatar_url: post.profiles?.avatar_url,
              created_at: post.created_at
            });
          });
        }
      }

      // Search users
      if (filter === "all" || filter === "users") {
        const { data: users } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .limit(20);

        if (users) {
          users.forEach(user => {
            results.push({
              id: user.id,
              type: 'user',
              username: user.username,
              display_name: user.display_name,
              avatar_url: user.avatar_url
            });
          });
        }
      }

      // Search hashtags
      if (filter === "all" || filter === "hashtags") {
        const { data: hashtagPosts } = await supabase
          .from('posts')
          .select('content')
          .ilike('content', `%#${query}%`)
          .limit(50);

        if (hashtagPosts) {
          const hashtagCounts: { [key: string]: number } = {};
          hashtagPosts.forEach(post => {
            const hashtags = post.content.match(/#\w+/g) || [];
            hashtags.forEach(hashtag => {
              const tag = hashtag.toLowerCase();
              if (tag.includes(query.toLowerCase())) {
                hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
              }
            });
          });

          Object.entries(hashtagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .forEach(([hashtag, count]) => {
              results.push({
                id: hashtag,
                type: 'hashtag',
                hashtag,
                post_count: count
              });
            });
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ search: searchTerm });
      performSearch(searchTerm, searchFilter);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      setSearchTerm(searchQuery);
      performSearch(searchQuery, searchFilter);
    }
  }, [searchQuery]);

  const renderSearchResults = () => {
    if (!searchTerm) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-600" />
            Search Results for "{searchTerm}"
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSearching ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No results found</p>
          ) : (
            <div className="space-y-4">
              {searchResults.map((result) => (
                <div key={`${result.type}-${result.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  {result.type === 'user' && (
                    <>
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {result.display_name?.[0] || result.username?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-medium">{result.display_name || result.username}</p>
                        <p className="text-sm text-gray-500">@{result.username}</p>
                      </div>
                    </>
                  )}
                  {result.type === 'post' && (
                    <>
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {result.display_name?.[0] || result.username?.[0] || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">@{result.username}</p>
                        <p className="text-sm line-clamp-2">{result.content}</p>
                      </div>
                    </>
                  )}
                  {result.type === 'hashtag' && (
                    <>
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <Hash className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{result.hashtag}</p>
                        <p className="text-sm text-gray-500">{result.post_count} posts</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <div className="p-6">
            {/* Header with Search */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-300 mb-2">
                Explore
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Discover trending content, users, and short video reels
              </p>
              
              {/* Enhanced Search */}
              <form onSubmit={handleSearch} className="flex gap-3 mb-4">
                <div className="flex-1 flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search posts, users, hashtags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={searchFilter} onValueChange={setSearchFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="posts">Posts</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                      <SelectItem value="hashtags">Hashtags</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isSearching}>
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Search Results */}
            {renderSearchResults()}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="reels" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Reels
                </TabsTrigger>
                <TabsTrigger value="hashtags" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Hashtags
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trending" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      What's Trending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TrendingWidget onHashtagClick={handleHashtagClick} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Professional Accounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProfessionalUsersWidget />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-purple-600" />
                      Find Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UserSearch showMessageButton />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Professional Accounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProfessionalUsersWidget />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reels" className="space-y-6">
                <ReelsSection />
              </TabsContent>

              <TabsContent value="hashtags" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-purple-600" />
                      Popular Hashtags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TrendingWidget onHashtagClick={handleHashtagClick} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default Explore;
