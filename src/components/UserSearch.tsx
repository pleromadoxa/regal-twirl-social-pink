
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  followers_count: number;
  following_count: number;
}

interface UserSearchProps {
  searchQuery: string;
  showMessageButton?: boolean;
}

const UserSearch = ({ searchQuery, showMessageButton = false }: UserSearchProps) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
          .limit(20);

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!searchQuery.trim()) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Start typing to search for users...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No users found matching "{searchQuery}"
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {users.map((profile) => (
        <Card key={profile.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold">
                  {profile.display_name?.[0] || profile.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm leading-tight">
                      {profile.display_name || profile.username}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      @{profile.username}
                    </p>
                    {profile.bio && (
                      <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1 mt-1">
                        {profile.bio}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{profile.followers_count || 0} followers</span>
                      <span>{profile.following_count || 0} following</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 ml-2 flex-shrink-0">
                    <Link to={`/profile/${profile.id}`}>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                        <User className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </Link>
                    {user?.id !== profile.id && showMessageButton && (
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Message
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserSearch;
