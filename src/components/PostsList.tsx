
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { usePosts } from '@/hooks/usePosts';
import { PostActions } from '@/components/PostActions';
import { PostIndicators } from '@/components/PostIndicators';
import { useAuth } from '@/contexts/AuthContext';
import { useVerifiedStatus } from '@/hooks/useVerifiedStatus';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Repeat } from 'lucide-react';

interface PostsListProps {
  posts?: any[];
  onLike?: (postId: string) => void;
  onRetweet?: (postId: string) => void;
  onPin?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  userId?: string;
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
  const [retweetedBy, setRetweetedBy] = useState<{[key: string]: any}>({});

  let posts = externalPosts || hookPosts;
  
  if (filterUserId && posts) {
    posts = posts.filter(post => post.user_id === filterUserId);
  }

  const onLike = externalOnLike || toggleLike;
  const onRetweet = externalOnRetweet || toggleRetweet;
  const onPin = externalOnPin || togglePin;
  const onDelete = externalOnDelete || deletePost;

  useEffect(() => {
    // Fetch retweet information for posts
    const fetchRetweetInfo = async () => {
      if (!posts || posts.length === 0) return;
      
      const retweetInfo: {[key: string]: any} = {};
      
      for (const post of posts) {
        if (post.user_retweeted && user) {
          // This post was retweeted by the current user
          retweetInfo[post.id] = {
            retweetedBy: user,
            isCurrentUser: true
          };
        }
      }
      
      setRetweetedBy(retweetInfo);
    };

    fetchRetweetInfo();
  }, [posts, user]);

  const isThreadPost = (content: string) => {
    return content.includes('\n\n') || content.toLowerCase().includes('thread') || content.includes('🧵');
  };

  const hasAudioContent = (content: string) => {
    return content.toLowerCase().includes('🎵') || 
           content.toLowerCase().includes('🎧') || 
           content.toLowerCase().includes('audio') ||
           content.toLowerCase().includes('music') ||
           content.toLowerCase().includes('🎶');
  };

  const formatThreadContent = (content: string) => {
    if (!content.includes('\n\n')) return content;
    
    const threadLines = content.split('\n\n').filter(line => line.trim());
    return (
      <div className="relative">
        {/* Connecting line for threads */}
        <div className="absolute left-4 top-8 w-0.5 bg-gradient-to-b from-purple-300 via-purple-200 to-purple-300 dark:from-purple-600 dark:via-purple-500 dark:to-purple-600 opacity-60" 
             style={{ height: `${(threadLines.length - 1) * 60}px` }}></div>
        <div className="absolute left-4 top-8 w-0.5 bg-gradient-to-b from-transparent via-white to-transparent dark:via-slate-800 opacity-40"
             style={{ height: `${(threadLines.length - 1) * 60}px` }}></div>
        
        {/* Dotted connecting lines between thread points */}
        {threadLines.map((_, index) => {
          if (index === threadLines.length - 1) return null;
          return (
            <div 
              key={`dot-${index}`}
              className="absolute left-3.5 w-1 h-1 bg-purple-400 dark:bg-purple-500 rounded-full" 
              style={{ top: `${40 + (index * 60)}px` }}
            />
          );
        })}
        
        {threadLines.map((line, index) => (
          <div key={index} className="flex gap-3 mb-4 relative">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg z-10 relative">
              {index + 1}
            </div>
            <div className="flex-1 text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
              {line.trim()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getVerifiedStatus = (user: any) => {
    if (!user) return false;
    
    if (user.username === 'pleromadoxa') {
      return true;
    }
    
    if (user.is_verified) {
      return true;
    }
    
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
        const isThread = isThreadPost(post.content);
        const hasAudio = hasAudioContent(post.content);
        const retweetInfo = retweetedBy[post.id];
        
        return (
          <Card 
            key={post.id} 
            className={`hover:shadow-xl transition-all duration-500 relative z-20 border border-slate-200 dark:border-slate-700 ${
              isThread 
                ? 'bg-gradient-to-br from-white/95 via-purple-50/80 to-pink-50/80 dark:from-slate-800/95 dark:via-purple-900/30 dark:to-pink-900/20 backdrop-blur-xl border-purple-200/50 dark:border-purple-700/50 shadow-lg' 
                : 'bg-white dark:bg-slate-800'
            }`}
          >
            <CardContent className="p-6 relative z-30">
              {/* Retweet indicator */}
              {retweetInfo && (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                  <Repeat className="w-4 h-4" />
                  <span>
                    {retweetInfo.isCurrentUser ? 'You' : `@${retweetInfo.retweetedBy.username}`} reshared
                  </span>
                </div>
              )}
              
              <PostIndicators 
                isThread={isThread} 
                hasAudio={hasAudio}
                className="relative z-40"
              />
              
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
                  
                  {isThread ? (
                    <div className={`relative z-40 mb-4 p-6 rounded-xl bg-gradient-to-br from-white/60 to-transparent dark:from-slate-800/60 dark:to-transparent backdrop-blur-sm border border-white/20 dark:border-slate-600/20`}>
                      {formatThreadContent(post.content)}
                    </div>
                  ) : (
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed relative z-40 mb-3">
                      {post.content}
                    </p>
                  )}
                  
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
