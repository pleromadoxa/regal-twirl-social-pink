import { useProfileReplies } from '@/hooks/useProfileReplies';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface ProfileRepliesListProps {
  userId?: string;
}

const ProfileRepliesList = ({ userId }: ProfileRepliesListProps) => {
  const { replies, loading } = useProfileReplies(userId);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (replies.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p>No replies yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <div key={reply.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          {/* Original Post Context */}
          {reply.posts && (
            <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-900 rounded border-l-4 border-purple-300">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={reply.posts.profiles?.avatar_url} />
                  <AvatarFallback>
                    {reply.posts.profiles?.display_name?.[0] || reply.posts.profiles?.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {reply.posts.profiles?.display_name || reply.posts.profiles?.username}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {reply.posts.content}
              </p>
            </div>
          )}
          
          {/* Reply Content */}
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={reply.profiles?.avatar_url} />
              <AvatarFallback>
                {reply.profiles?.display_name?.[0] || reply.profiles?.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {reply.profiles?.display_name || reply.profiles?.username}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                </span>
              </div>
              
              <div className="mt-1">
                <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                  {reply.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileRepliesList;