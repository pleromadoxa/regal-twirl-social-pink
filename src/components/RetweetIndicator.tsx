
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Repeat } from 'lucide-react';

interface RetweetIndicatorProps {
  users: any[];
  currentUserId?: string;
  postAuthorId?: string;
}

const RetweetIndicator = ({ users, currentUserId, postAuthorId }: RetweetIndicatorProps) => {
  if (!users || users.length === 0) return null;

  // Filter out the original post author from reshares (they can't reshare their own post)
  const validRetweetUsers = users.filter(u => u.user_id !== postAuthorId);
  
  if (validRetweetUsers.length === 0) return null;

  const currentUserRetweeted = validRetweetUsers.some(u => u.user_id === currentUserId);
  const otherUsers = validRetweetUsers.filter(u => u.user_id !== currentUserId);

  if (currentUserRetweeted && otherUsers.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700/50">
        <Repeat className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="text-green-700 dark:text-green-300 font-medium">
          You re-shared this post
        </span>
      </div>
    );
  }

  if (otherUsers.length > 0) {
    const firstUser = otherUsers[0];
    const remainingUsers = otherUsers.slice(1);

    return (
      <div className="flex items-center gap-2 text-sm mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700/50">
        <Repeat className="w-4 h-4 text-green-600 dark:text-green-400" />
        <div className="flex items-center gap-1">
          <Avatar className="w-5 h-5">
            <AvatarImage src={firstUser.avatar_url} />
            <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
              {firstUser.display_name?.[0] || firstUser.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          {remainingUsers.length > 0 && (
            <div className="flex -ml-2">
              {remainingUsers.slice(0, 2).map((user, index) => (
                <Avatar key={user.user_id} className={`w-5 h-5 ring-2 ring-white dark:ring-slate-800 ${index > 0 ? '-ml-1' : ''}`}>
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                    {user.display_name?.[0] || user.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {remainingUsers.length > 2 && (
                <div className="w-5 h-5 -ml-1 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
                  <span className="text-xs font-medium">+{remainingUsers.length - 2}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <span className="text-green-700 dark:text-green-300 font-medium">
          {currentUserRetweeted ? 'You, ' : ''}
          <span className="font-semibold">@{firstUser.username || firstUser.display_name}</span>
          {remainingUsers.length > 0 && ` and ${remainingUsers.length} other${remainingUsers.length > 1 ? 's' : ''}`}
          {' '}re-shared this post
        </span>
      </div>
    );
  }

  return null;
};

export default RetweetIndicator;
