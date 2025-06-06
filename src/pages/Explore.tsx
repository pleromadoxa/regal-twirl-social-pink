
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, Users, Building, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessPages } from "@/hooks/useBusinessPages";

interface SearchUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  followers_count: number;
}

const Explore = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { pages, loading: pagesLoading, toggleFollow } = useBusinessPages();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  const fetchSuggestedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio, followers_count')
        .order('followers_count', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching suggested users:', error);
        return;
      }

      setSuggestedUsers(data || []);
    } catch (error) {
      console.error('Error in fetchSuggestedUsers:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio, followers_count')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(20);

      if (error) {
        console.error('Search error:', error);
        return;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const UserCard = ({ user: searchUser }: { user: SearchUser }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden">
            {searchUser.avatar_url ? (
              <img
                src={searchUser.avatar_url}
                alt={searchUser.display_name || searchUser.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                {(searchUser.display_name || searchUser.username || 'U')[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {searchUser.display_name || searchUser.username}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              @{searchUser.username} • {searchUser.followers_count || 0} followers
            </p>
            {searchUser.bio && (
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                {searchUser.bio}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/profile/${searchUser.id}`)}
            >
              View
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/messages?user=${searchUser.id}`)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const BusinessPageCard = ({ page }: { page: typeof pages[0] }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden">
            {page.avatar_url ? (
              <img
                src={page.avatar_url}
                alt={page.page_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {page.page_name}
              </h3>
              {page.is_verified && <span className="text-blue-500">✓</span>}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {page.page_type} • {page.followers_count || 0} followers
            </p>
            {page.description && (
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                {page.description}
              </p>
            )}
          </div>
          <Button
            variant={page.user_following ? "outline" : "default"}
            size="sm"
            onClick={() => toggleFollow(page.id)}
            className={!page.user_following ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            {page.user_following ? 'Following' : 'Follow'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const trendingTopics = [
    { topic: '#TechNews', posts: '12.5k posts' },
    { topic: '#WebDev', posts: '8.2k posts' },
    { topic: '#AI', posts: '15.1k posts' },
    { topic: '#Startup', posts: '6.7k posts' },
    { topic: '#Design', posts: '9.3k posts' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <SidebarNav />
      
      <main className="flex-1 max-w-4xl mx-auto border-x border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Explore</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search users and pages..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-slate-100 dark:bg-slate-700 border-none"
            />
          </div>
        </div>

        <div className="p-4">
          {searchQuery ? (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Search Results for "{searchQuery}"
              </h2>
              {isSearching ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                  {searchResults.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No users found for "{searchQuery}"</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  People
                </TabsTrigger>
                <TabsTrigger value="pages" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Pages
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Suggested People</h2>
                <div className="space-y-3">
                  {suggestedUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pages" className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Business & Professional Pages</h2>
                {pagesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pages.map((page) => (
                      <BusinessPageCard key={page.id} page={page} />
                    ))}
                    {pages.length === 0 && (
                      <p className="text-center text-slate-500 py-8">No business pages found</p>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trending" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      What's trending
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {trendingTopics.map((trend, index) => (
                      <div key={index} className="flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded-lg cursor-pointer transition-colors">
                        <div>
                          <p className="font-medium text-sm">{trend.topic}</p>
                          <p className="text-xs text-slate-500">{trend.posts}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default Explore;
