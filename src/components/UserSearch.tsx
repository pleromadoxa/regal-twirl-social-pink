
import { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, UserCheck, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFollow } from '@/hooks/useFollow';
import { useNavigate } from 'react-router-dom';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useToast } from '@/hooks/use-toast';

interface UserResult {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_verified: boolean;
  followers_count: number;
  bio: string;
}

interface UserSearchProps {
  onStartConversation?: (userId: string) => void;
  showMessageButton?: boolean;
}

const UserSearch = ({ onStartConversation, showMessageButton = false }: UserSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const searchRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { followUser, unfollowUser, checkFollowStatus, loading: followLoading } = useFollow();
  const { startDirectConversation } = useEnhancedMessages();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 1) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      setShowResults(true);
      
      try {
        console.log('Searching for users with query:', query);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, is_verified, followers_count, bio')
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .neq('id', user?.id || '')
          .limit(10);

        if (error) {
          console.error('Search error:', error);
          throw error;
        }

        console.log('Search results:', data);
        const users = data || [];
        setResults(users);

        // Check follow status for each user
        if (user && users.length > 0) {
          const statusPromises = users.map(async (searchUser) => {
            try {
              const isFollowing = await checkFollowStatus(searchUser.id);
              return { userId: searchUser.id, isFollowing };
            } catch (error) {
              console.error('Error checking follow status:', error);
              return { userId: searchUser.id, isFollowing: false };
            }
          });

          const statuses = await Promise.all(statusPromises);
          const statusMap = statuses.reduce((acc, { userId, isFollowing }) => {
            acc[userId] = isFollowing;
            return acc;
          }, {} as Record<string, boolean>);

          setFollowingStatus(statusMap);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setResults([]);
        toast({
          title: "Search error",
          description: "Failed to search for users. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    // Immediate search without debounce for better UX
    searchUsers();
  }, [query, user, checkFollowStatus, toast]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFollow = async (userId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        variant: "destructive"
      });
      return;
    }

    const isCurrentlyFollowing = followingStatus[userId];
    
    try {
      if (isCurrentlyFollowing) {
        const success = await unfollowUser(userId);
        if (success) {
          setFollowingStatus(prev => ({ ...prev, [userId]: false }));
        }
      } else {
        const success = await followUser(userId);
        if (success) {
          setFollowingStatus(prev => ({ ...prev, [userId]: true }));
        }
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    setShowResults(false);
    setQuery('');
  };

  const handleStartConversation = async (userId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to start a conversation",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Starting conversation with user:', userId);
      await startDirectConversation(userId);
      navigate('/messages');
      setShowResults(false);
      setQuery('');
      
      if (onStartConversation) {
        onStartConversation(userId);
      }

      toast({
        title: "Conversation started",
        description: "You can now start messaging this user.",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(results.length > 0 || query.length > 0)}
          className="pl-10 bg-slate-100 dark:bg-slate-800 border-0 rounded-full focus:ring-2 focus:ring-purple-500 transition-all"
        />
      </div>

      {showResults && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-sm">Searching users...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((userResult) => (
                <div
                  key={userResult.id}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <div 
                    className="flex items-center space-x-3 flex-1 cursor-pointer"
                    onClick={() => handleUserClick(userResult.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userResult.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {userResult.display_name?.[0]?.toUpperCase() || userResult.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {userResult.display_name || userResult.username}
                        </p>
                        {userResult.is_verified && (
                          <Badge className="bg-blue-500 text-white text-xs px-1 py-0">✓</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">@{userResult.username}</p>
                      {userResult.bio && (
                        <p className="text-xs text-slate-400 truncate mt-1">{userResult.bio}</p>
                      )}
                      <p className="text-xs text-slate-400">
                        {userResult.followers_count || 0} followers
                      </p>
                    </div>
                  </div>
                  
                  {user && user.id !== userResult.id && (
                    <div className="flex items-center gap-2">
                      {showMessageButton && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartConversation(userResult.id);
                          }}
                          variant="outline"
                          size="sm"
                          className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollow(userResult.id);
                        }}
                        variant={followingStatus[userResult.id] ? "outline" : "default"}
                        size="sm"
                        disabled={followLoading}
                        className={
                          followingStatus[userResult.id]
                            ? "border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        }
                      >
                        {followingStatus[userResult.id] ? (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-1" />
                            Follow
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : query.length > 0 ? (
            <div className="p-4 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No users found for "{query}"</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
