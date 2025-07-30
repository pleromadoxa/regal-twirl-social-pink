import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import VerificationBadge from './VerificationBadge';
import { useVerifiedStatus } from '@/hooks/useVerifiedStatus';

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  followers_count: number;
  premium_tier?: string;
  is_verified?: boolean;
}

const WhoToFollow = () => {
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchSuggestedUsers();
      fetchFollowingStatus();
    }
  }, [user]);

  const fetchSuggestedUsers = async () => {
    try {
      // Get random users excluding current user and already followed users
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, followers_count, premium_tier, is_verified')
        .neq('id', user?.id)
        .limit(20);

      if (error) throw error;

      // Randomize and take 5 users
      const shuffled = users?.sort(() => 0.5 - Math.random()).slice(0, 5) || [];
      setSuggestedUsers(shuffled);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowingStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user?.id);

      if (error) throw error;

      const followingSet = new Set(data?.map(f => f.following_id) || []);
      setFollowingUsers(followingSet);
    } catch (error) {
      console.error('Error fetching following status:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user?.id,
          following_id: userId
        });

      if (error) throw error;

      setFollowingUsers(prev => new Set([...prev, userId]));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user?.id)
        .eq('following_id', userId);

      if (error) throw error;

      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Who to follow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-1"></div>
                </div>
                <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Who to follow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestedUsers.map((suggestedUser) => {
            const { verificationLevel } = useVerifiedStatus(suggestedUser);
            const isFollowing = followingUsers.has(suggestedUser.id);
            
            return (
              <div key={suggestedUser.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                <Avatar 
                  className="w-10 h-10 cursor-pointer ring-2 ring-purple-200 dark:ring-purple-700 hover:ring-purple-400 transition-all"
                  onClick={() => navigate(`/profile/${suggestedUser.username}`)}
                >
                  <AvatarImage src={suggestedUser.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-semibold">
                    {suggestedUser.display_name?.[0] || suggestedUser.username?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p 
                      className="font-semibold text-sm truncate cursor-pointer hover:text-purple-600 transition-colors"
                      onClick={() => navigate(`/profile/${suggestedUser.username}`)}
                    >
                      {suggestedUser.display_name || suggestedUser.username}
                    </p>
                    <VerificationBadge level={verificationLevel} showText={false} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    @{suggestedUser.username}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {suggestedUser.followers_count} followers
                  </p>
                </div>
                
                <Button
                  size="sm"
                  variant={isFollowing ? "outline" : "default"}
                  onClick={() => isFollowing ? handleUnfollow(suggestedUser.id) : handleFollow(suggestedUser.id)}
                  className={`text-xs px-3 py-1 ${
                    isFollowing 
                      ? 'border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0'
                  }`}
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            );
          })}
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full mt-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20"
          onClick={() => navigate('/explore')}
        >
          Show more
        </Button>
      </CardContent>
    </Card>
  );
};

export default WhoToFollow;