
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { usePosts } from '@/hooks/usePosts';
import { PostActions } from '@/components/PostActions';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MessageCircle, Hash, MapPin } from 'lucide-react';

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
  const getVerifiedStatus = (userProfile: any) => {
    if (!userProfile) return false;
    
    // Special case for @pleromadoxa
    if (userProfile.username === 'pleromadoxa') {
      return true;
    }
    
    // Check if manually verified
    if (userProfile.is_verified) {
      return true;
    }
    
    // Check if has 100+ followers
    if (userProfile.followers_count && userProfile.followers_count >= 100) {
      return true;
    }
    
    return false;
  };

  const isThreadPost = (content: string) => {
    return content.includes('🧵') && /\d+\/\d+/.test(content);
  };

  const parseThreadPost = (content: string) => {
    const threadMatch = content.match(/🧵\s*(\d+)\/(\d+)\s*(.*)/s);
    if (threadMatch) {
      return {
        isThread: true,
        current: parseInt(threadMatch[1]),
        total: parseInt(threadMatch[2]),
        content: threadMatch[3].trim()
      };
    }
    return { isThread: false, content };
  };

  const getPostVariant = (index: number, isThread: boolean) => {
    if (isThread) return 'thread';
    
    const variants = ['default', 'gradient', 'minimal', 'highlighted'];
    return variants[index % variants.length];
  };

  const getPostStyles = (variant: string, isThread: boolean, threadInfo?: any) => {
    if (isThread) {
      return {
        card: "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-blue-500 relative",
        content: "relative",
        threadIndicator: threadInfo?.current === 1 ? "absolute -top-2 left-4 w-4 h-4 bg-blue-500 rounded-full" : ""
      };
    }

    switch (variant) {
      case 'gradient':
        return {
          card: "bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-blue-900/10 border border-purple-200 dark:border-purple-700",
          content: ""
        };
      case 'minimal':
        return {
          card: "bg-transparent border-0 shadow-none",
          content: "border-b border-slate-100 dark:border-slate-800 pb-4"
        };
      case 'highlighted':
        return {
          card: "bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 shadow-lg",
          content: ""
        };
      default:
        return {
          card: "hover:shadow-md transition-shadow bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
          content: ""
        };
    }
  };

  if (loading && !externalPosts) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts?.map((post, index) => {
        // Handle both cases: posts from usePosts hook (with profiles) and direct posts (without profiles)
        const userProfile = post.profiles || {
          username: 'unknown',
          display_name: 'Unknown User',
          avatar_url: '',
          is_verified: false,
          followers_count: 0
        };
        
        const isVerified = getVerifiedStatus(userProfile);
        const threadInfo = parseThreadPost(post.content);
        const variant = getPostVariant(index, threadInfo.isThread);
        const styles = getPostStyles(variant, threadInfo.isThread, threadInfo);
        
        return (
          <Card key={post.id} className={styles.card}>
            {threadInfo.isThread && threadInfo.current > 1 && (
              <div className="absolute -top-4 left-12 w-0.5 h-4 bg-blue-400"></div>
            )}
            
            <CardContent className={`p-6 ${styles.content}`}>
              {threadInfo.isThread && (
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Thread {threadInfo.current}/{threadInfo.total}
                  </Badge>
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={userProfile.avatar_url} />
                  <AvatarFallback>
                    {userProfile.display_name?.[0] || userProfile.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {userProfile.display_name || userProfile.username}
                      </h3>
                      {isVerified && (
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 px-1.5 py-0.5">
                          <CheckCircle className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">@{userProfile.username}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-sm">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    {post.content.split('\n').map((line: string, lineIndex: number) => {
                      if (line.startsWith('📍')) {
                        return (
                          <div key={lineIndex} className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm mt-2">
                            <MapPin className="w-4 h-4" />
                            {line.replace('📍', '').trim()}
                          </div>
                        );
                      }
                      
                      if (line.includes('#')) {
                        return (
                          <p key={lineIndex} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {line.split(' ').map((word, wordIndex) => 
                              word.startsWith('#') ? (
                                <span key={wordIndex} className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
                                  {word}{' '}
                                </span>
                              ) : (
                                <span key={wordIndex}>{word}{' '}</span>
                              )
                            )}
                          </p>
                        );
                      }
                      
                      return (
                        <p key={lineIndex} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                  
                  <PostActions 
                    postId={post.id}
                    userId={post.user_id}
                    likesCount={post.likes_count || 0}
                    retweetsCount={post.retweets_count || 0}
                    repliesCount={post.replies_count || 0}
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
            </CardContent>
            
            {threadInfo.isThread && threadInfo.current < threadInfo.total && (
              <div className="absolute -bottom-4 left-12 w-0.5 h-4 bg-blue-400"></div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default PostsList;
