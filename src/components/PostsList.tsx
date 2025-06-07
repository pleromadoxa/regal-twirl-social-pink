
import React from 'react';
import { usePosts } from '@/hooks/usePosts';
import PostComposer from './PostComposer';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface PostsListProps {
  userId?: string; // Optional userId to filter posts by specific user
}

const PostsList: React.FC<PostsListProps> = ({ userId }) => {
  const { posts, loading, toggleLike, toggleRetweet, togglePin } = usePosts(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600 dark:text-slate-400">
        <p>No posts to show yet.</p>
        {!userId && <p className="text-sm mt-2">Be the first to share something!</p>}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {posts.map((post) => (
        <Card key={post.id} className="border-x-0 border-t-0 border-b border-purple-200 dark:border-purple-800 rounded-none bg-transparent hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors">
          <div className="p-4">
            <div className="flex space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.profiles.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                  {post.profiles.display_name?.[0] || post.profiles.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {post.profiles.display_name || post.profiles.username}
                  </span>
                  {post.profiles.is_verified && (
                    <Badge variant="verified" className="h-5">
                      Verified
                    </Badge>
                  )}
                  <span className="text-slate-500 dark:text-slate-400">
                    @{post.profiles.username}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">·</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                  {post.user_pinned && (
                    <>
                      <span className="text-slate-500 dark:text-slate-400">·</span>
                      <Pin className="h-4 w-4 text-purple-600" />
                    </>
                  )}
                </div>
                
                <div className="mt-2">
                  <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                    {post.content}
                  </p>
                  
                  {post.image_urls && post.image_urls.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {post.image_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt="Post attachment"
                          className="rounded-lg max-h-64 object-cover w-full"
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4 max-w-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">{post.replies_count}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRetweet(post.id)}
                    className={`text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 ${
                      post.user_retweeted ? 'text-green-600' : ''
                    }`}
                  >
                    <Repeat2 className="h-4 w-4 mr-1" />
                    <span className="text-sm">{post.retweets_count}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className={`text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ${
                      post.user_liked ? 'text-red-600' : ''
                    }`}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${post.user_liked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{post.likes_count}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePin(post.id)}
                    className={`text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 ${
                      post.user_pinned ? 'text-purple-600' : ''
                    }`}
                  >
                    <Pin className={`h-4 w-4 ${post.user_pinned ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PostsList;
