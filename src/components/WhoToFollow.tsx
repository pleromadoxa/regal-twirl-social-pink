import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useVerifiedStatus } from '@/hooks/useVerifiedStatus';
import VerificationBadge from './VerificationBadge';
import FollowButton from './FollowButton';

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  followers_count: number;
  is_verified?: boolean;
  premium_tier?: string;
}

const UserSuggestionItem = ({ user, onFollowChange }: { user: User; onFollowChange: (userId: string) => void }) => {
  const { verificationLevel } = useVerifiedStatus(user);
  
  return (
    <div className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
      <Link to={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>
            {user.display_name?.[0] || user.username?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user.display_name || user.username}
            </p>
            <VerificationBadge 
              level={verificationLevel} 
              showText={false}
              className="flex-shrink-0"
            />
          </div>
          <p className="text-xs text-gray-500 truncate">@{user.username}</p>
          <p className="text-xs text-gray-400">{user.followers_count} followers</p>
        </div>
      </Link>
      <FollowButton 
        userId={user.id}
        initialFollowing={false}
        size="sm"
        className="text-xs px-3 py-1 h-8 flex-shrink-0"
        onFollowChange={() => onFollowChange(user.id)}
      />
    </div>
  );
};

const WhoToFollow = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRandomUsers = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch users excluding current user and those already followed
      const { data: followingIds } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const excludeIds = [user.id, ...(followingIds?.map(f => f.following_id) || [])];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, followers_count, is_verified, premium_tier')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .not('username', 'is', null)
        .limit(10);

      if (error) throw error;

      // Shuffle and take first 5
      const shuffled = data?.sort(() => 0.5 - Math.random()).slice(0, 5) || [];
      setUsers(shuffled);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRandomUsers();
  }, [fetchRandomUsers]);

  const handleFollowChange = (userId: string) => {
    // Remove user from suggestions after following
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  if (!user) return null;

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Who to follow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-24 h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <>
            {users.map((suggestedUser) => (
              <UserSuggestionItem
                key={suggestedUser.id}
                user={suggestedUser}
                onFollowChange={handleFollowChange}
              />
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchRandomUsers}
              className="w-full mt-3 text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              Show more suggestions
            </Button>
          </>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No suggestions available right now
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default WhoToFollow;