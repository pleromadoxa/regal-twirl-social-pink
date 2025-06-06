
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

interface PostsListProps {
  posts?: any[];
  onLike?: (postId: string) => void;
  onRetweet?: (postId: string) => void;
  onPin?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  userId?: string; // Add userId prop
}

export const PostsList = ({ 
  posts: externalPosts, 
  onLike: externalOnLike, 
  onRetweet: externalOnRetweet, 
  onPin: externalOnPin, 
  onDelete: externalOnDelete,
  userId: filterUserId
}: PostsListProps = {}) => {
  const { posts: hookPosts, loading, toggleLike, toggleRetweet, togglePin, deletePost } = usePosts();
  const { user } = useAuth();

  // Use external posts if provided, otherwise use hook posts
  let posts = externalPosts || hookPosts;
  
  // Filter posts by userId if provided
  if (filterUserId && posts) {
    posts = posts.filter(post => post.user_id === filterUserId);
  }

  const onLike = externalOnLike || toggleLike;
  const onRetweet = externalOnRetweet || toggleRetweet;
  const onPin = externalOnPin || togglePin;
  const onDelete = externalOnDelete || deletePost;

  // Pre-calculate verified status for all posts to avoid calling hooks in render loop
  const getVerifiedStatus = (user: any) => {
    if (!user) return false;
    
    // Special case for @pleromadoxa
    if (user.username === 'pleromadoxa') {
      return true;
    }
    
    // Check if manually verified
    if (user.is_verified) {
      return true;
    }
    
    // Check if has 100+ followers
    if (user.followers_count && user.followers_count >= 100) {
      return true;
    }
    
    return false;
  };

  if (loading && !externalPosts) {
    return (
      <div className="flex items-center justify-center py-8 relative z-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative z-10">
      {posts.map((post) => {
        const isVerified = getVerifiedStatus(post.profiles);
        
        return (
          <Card key={post.id} className="hover:shadow-md transition-shadow relative z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardContent className="p-6 relative z-30">
              <div className="flex items-start space-x-3">
                <Avatar className="w-12 h-12 relative z-40">
                  <AvatarImage src={post.profiles.avatar_url} />
                  <AvatarFallback>
                    {post.profiles.display_name?.[0] || post.profiles.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 relative z-40">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {post.profiles.display_name || post.profiles.username}
                      </h3>
                      {isVerified && (
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 px-1.5 py-0.5 relative z-50">
                          <CheckCircle className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">@{post.profiles.username}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-sm">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed relative z-40 mb-3">
                    {post.content}
                  </p>
                  
                  {/* Display images if available */}
                  {post.image_urls && post.image_urls.length > 0 && (
                    <div className={`grid gap-2 mb-3 rounded-lg overflow-hidden ${
                      post.image_urls.length === 1 ? 'grid-cols-1' : 
                      post.image_urls.length === 2 ? 'grid-cols-2' : 
                      post.image_urls.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
                    }`}>
                      {post.image_urls.map((imageUrl: string, index: number) => (
                        <div 
                          key={index} 
                          className={`relative ${
                            post.image_urls.length === 3 && index === 0 ? 'col-span-2' : ''
                          }`}
                        >
                          <img
                            src={imageUrl}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                            onClick={() => window.open(imageUrl, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="relative z-40">
                    <PostActions 
                      postId={post.id}
                      userId={post.user_id}
                      likesCount={post.likes_count}
                      retweetsCount={post.retweets_count}
                      repliesCount={post.replies_count}
                      userLiked={post.user_liked}
                      userRetweeted={post.user_retweeted}
                      userPinned={post.user_pinned}
                      onLike={() => onLike(post.id)}
                      onRetweet={() => onRetweet(post.id)}
                      onPin={() => onPin(post.id)}
                      onDelete={() => onDelete(post.id)}
                      isOwnPost={user?.id === post.user_id}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PostsList;
