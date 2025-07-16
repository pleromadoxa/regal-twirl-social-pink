
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
    <div className="space-y-4">
      {users.map((profile) => (
        <Card key={profile.id} className="bg-white/80 dark:bg-slate-800/80">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>
                  {profile.display_name?.[0] || profile.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {profile.display_name || profile.username}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  @{profile.username}
                </p>
                {profile.bio && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                    {profile.bio}
                  </p>
                )}
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{profile.followers_count} followers</span>
                  <span>{profile.following_count} following</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link to={`/profile/${profile.id}`}>
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </Link>
                {user?.id !== profile.id && showMessageButton && (
                  <Button variant="outline" size="sm">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserSearch;
