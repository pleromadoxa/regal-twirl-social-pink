
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { usePosts } from '@/hooks/usePosts';
import { PostActions } from '@/components/PostActions';
import { useAuth } from '@/contexts/AuthContext';
import { useVerifiedStatus } from '@/hooks/useVerifiedStatus';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

export const PostsList = () => {
  const { posts, loading, toggleLike, toggleRetweet, togglePin, deletePost } = usePosts();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const isVerified = useVerifiedStatus(post.profiles);
        
        return (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.profiles.avatar_url} />
                  <AvatarFallback>
                    {post.profiles.display_name?.[0] || post.profiles.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {post.profiles.display_name || post.profiles.username}
                      </h3>
                      {isVerified && (
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 px-1.5 py-0.5">
                          <CheckCircle className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">@{post.profiles.username}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-sm">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {post.content}
                  </p>
                  <PostActions 
                    postId={post.id}
                    userId={post.user_id}
                    likesCount={post.likes_count}
                    retweetsCount={post.retweets_count}
                    repliesCount={post.replies_count}
                    userLiked={post.user_liked}
                    userRetweeted={post.user_retweeted}
                    userPinned={post.user_pinned}
                    onLike={() => toggleLike(post.id)}
                    onRetweet={() => toggleRetweet(post.id)}
                    onPin={() => togglePin(post.id)}
                    onDelete={() => deletePost(post.id)}
                    isOwnPost={user?.id === post.user_id}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Add default export
export default PostsList;
