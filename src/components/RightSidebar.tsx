
import { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

const RightSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(5);

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

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    setSearchQuery('');
    setSearchResults([]);
  };

  const trendingTopics = [
    { topic: '#TechNews', posts: '12.5k posts' },
    { topic: '#WebDev', posts: '8.2k posts' },
    { topic: '#AI', posts: '15.1k posts' },
    { topic: '#Startup', posts: '6.7k posts' },
    { topic: '#Design', posts: '9.3k posts' }
  ];

  return (
    <aside className="w-80 p-4 space-y-4 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
      {/* Header with Search and Notifications */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 mr-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-slate-100 dark:bg-slate-700 border-none"
          />
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {(user.display_name || user.username || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="text-left">
                    <p className="font-medium text-sm">{user.display_name || user.username}</p>
                    <p className="text-xs text-slate-500">@{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {user && <NotificationDropdown />}
      </div>

      {/* Trending Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
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
          <Button variant="ghost" className="w-full text-purple-600 hover:text-purple-700 text-sm">
            Show more
          </Button>
        </CardContent>
      </Card>

      {/* Who to follow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Who to follow</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Discover new people and expand your network!</p>
          <Button 
            variant="outline" 
            className="w-full mt-3"
            onClick={() => navigate('/explore')}
          >
            Explore people
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
};

export default RightSidebar;
