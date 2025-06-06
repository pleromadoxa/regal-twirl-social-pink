
import { useState, useEffect } from 'react';
import { Search, UserCheck, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SearchUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  followers_count: number;
  is_verified: boolean;
  isFollowing?: boolean;
}

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const searchUsers = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio, followers_count, is_verified')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10);

      if (error) {
        console.error('Search error:', error);
        return;
      }

      if (user && data) {
        // Check which users the current user follows
        const userIds = data.map(u => u.id);
        const { data: followsData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .in('following_id', userIds);

        const followedIds = new Set(followsData?.map(f => f.following_id) || []);
        
        const enrichedResults = data.map(user => ({
          ...user,
          username: user.username || 'user',
          display_name: user.display_name || 'Anonymous',
          avatar_url: user.avatar_url || '',
          bio: user.bio || '',
          followers_count: user.followers_count || 0,
          is_verified: user.is_verified || false,
          isFollowing: followedIds.has(user.id)
        }));

        setSearchResults(enrichedResults);
        
        // Initialize following states
        const initialStates: Record<string, boolean> = {};
        enrichedResults.forEach(u => {
          initialStates[u.id] = u.isFollowing || false;
        });
        setFollowingStates(initialStates);
      } else {
        setSearchResults(data || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFollow = async (userId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow users",
        variant: "destructive"
      });
      return;
    }

    const isCurrentlyFollowing = followingStates[userId];

    try {
      if (isCurrentlyFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: userId });
      }

      setFollowingStates(prev => ({
        ...prev,
        [userId]: !isCurrentlyFollowing
      }));

      // Update the search results
      setSearchResults(prev => prev.map(u => 
        u.id === userId 
          ? { 
              ...u, 
              followers_count: isCurrentlyFollowing ? u.followers_count - 1 : u.followers_count + 1,
              isFollowing: !isCurrentlyFollowing
            }
          : u
      ));

      toast({
        title: isCurrentlyFollowing ? "Unfollowed" : "Following",
        description: `You are ${isCurrentlyFollowing ? 'no longer following' : 'now following'} this user`,
      });
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Search users by name or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 rounded-2xl border-purple-200 focus:border-purple-500 bg-white/50 backdrop-blur-sm"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-3 animate-slide-up">
          {searchResults.map((searchUser) => (
            <Card key={searchUser.id} className="p-4 hover:shadow-lg transition-all duration-200 border-purple-100 hover:border-purple-300">
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => navigate(`/profile/${searchUser.id}`)}
                >
                  {searchUser.avatar_url ? (
                    <img
                      src={searchUser.avatar_url}
                      alt={searchUser.display_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {(searchUser.display_name || searchUser.username || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {searchUser.display_name || searchUser.username}
                      </h3>
                      {searchUser.is_verified && (
                        <span className="text-blue-500">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">@{searchUser.username}</p>
                    {searchUser.bio && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {searchUser.bio}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {searchUser.followers_count} followers
                    </p>
                  </div>
                </div>
                
                {user && user.id !== searchUser.id && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/messages?user=${searchUser.id}`)}
                      className="rounded-xl"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => toggleFollow(searchUser.id)}
                      variant={followingStates[searchUser.id] ? "secondary" : "default"}
                      size="sm"
                      className={`rounded-xl min-w-20 ${
                        followingStates[searchUser.id] 
                          ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      }`}
                    >
                      {followingStates[searchUser.id] ? (
                        <>
                          <UserCheck className="w-4 h-4 mr-1" />
                          Following
                        </>
                      ) : (
                        'Follow'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
        <Card className="p-8 text-center border-purple-100">
          <Search className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500">No users found for "{searchQuery}"</p>
        </Card>
      )}
    </div>
  );
};

export default UserSearch;
