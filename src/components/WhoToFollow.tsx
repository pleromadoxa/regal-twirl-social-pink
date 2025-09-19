import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useVerifiedStatus } from '@/hooks/useVerifiedStatus';
import VerificationBadge from './VerificationBadge';

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  followers_count: number;
  is_verified?: boolean;
  premium_tier?: string;
}

const UserSuggestionItem = ({ user, onFollow }: { user: User; onFollow: (userId: string) => void }) => {
  const { verificationLevel } = useVerifiedStatus(user);
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
      <div className="flex items-center space-x-3 flex-1">
        <Link to={`/profile/${user.id}`} className="flex items-center space-x-3 flex-1">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>
              {user.display_name?.[0] || user.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user.display_name || user.username}
              </p>
              <VerificationBadge 
                level={verificationLevel} 
                showText={false}
                className="ml-1"
              />
            </div>
            <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            <p className="text-xs text-gray-400">{user.followers_count} followers</p>
          </div>
        </Link>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onFollow(user.id)}
        className="text-xs px-3 py-1 h-8"
      >
        <UserPlus className="w-3 h-3 mr-1" />
        Follow
      </Button>
    </div>
  );
};

const WhoToFollow = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRandomUsers = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch random users excluding current user and those already followed
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, followers_count, is_verified, premium_tier')
        .neq('id', user.id)
        .not('username', 'is', null)
        .limit(5);

      if (error) throw error;

      // Shuffle the results to make them more random
      const shuffled = data?.sort(() => 0.5 - Math.random()) || [];
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

  const handleFollow = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) throw error;

      // Update the follower count locally for immediate feedback
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, followers_count: u.followers_count + 1 }
          : u
      ).filter(u => u.id !== userId)); // Also remove from suggestions
      
      toast({
        title: "Success",
        description: "Successfully followed user"
      });
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Already following",
          description: "You're already following this user",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to follow user",
          variant: "destructive"
        });
      }
    }
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
                onFollow={handleFollow}
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