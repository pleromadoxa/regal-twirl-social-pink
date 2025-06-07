
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

interface UserMentionsProps {
  query: string;
  onSelect: (username: string) => void;
  isVisible: boolean;
}

const UserMentions = ({ query, onSelect, isVisible }: UserMentionsProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length > 0 && isVisible) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [query, isVisible]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible || users.length === 0) return null;

  return (
    <div className="absolute bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 w-64">
      {loading ? (
        <div className="p-3 text-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
              onClick={() => onSelect(user.username)}
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>
                  {user.display_name?.[0] || user.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm">
                  {user.display_name || user.username}
                </div>
                <div className="text-xs text-slate-500">@{user.username}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserMentions;
