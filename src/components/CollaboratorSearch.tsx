import React, { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio?: string;
  followers_count: number;
}

interface CollaboratorSearchProps {
  onUserSelect: (user: UserProfile) => void;
  placeholder?: string;
  excludeUserIds?: string[];
}

const CollaboratorSearch = ({ 
  onUserSelect, 
  placeholder = "Search users...", 
  excludeUserIds = [] 
}: CollaboratorSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio, followers_count')
        .or(
          `username.ilike.%${query}%,display_name.ilike.%${query}%`
        )
        .not('id', 'in', `(${[currentUser?.id, ...excludeUserIds].filter(Boolean).join(',')})`)
        .limit(10);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleUserSelect = (user: UserProfile) => {
    onUserSelect(user);
    setSearchQuery('');
    setUsers([]);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>

      {searchQuery.length >= 2 && (
        <div className="border rounded-lg bg-card max-h-48 overflow-hidden">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No users found
            </div>
          ) : (
            <ScrollArea className="max-h-48">
              <div className="p-2 space-y-1">
                {users.map((user) => (
                  <Button
                    key={user.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-2"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.display_name?.[0]?.toUpperCase() || 
                           user.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm">
                          {user.display_name || user.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{user.username} • {user.followers_count} followers
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
};

export default CollaboratorSearch;