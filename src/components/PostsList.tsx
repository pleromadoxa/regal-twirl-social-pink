import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { usePosts } from '@/hooks/usePosts';
import { PostActions } from '@/components/PostActions';
import { PostIndicators } from '@/components/PostIndicators';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Repeat } from 'lucide-react';
import PostComments from './PostComments';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [retweetedBy, setRetweetedBy] = useState<{[key: string]: any}>({});
  const [commentsOpen, setCommentsOpen] = useState<{[key: string]: boolean}>({});
  const [newPostNotification, setNewPostNotification] = useState<string | null>(null);

  let posts = externalPosts || hookPosts;
  
  if (filterUserId && posts) {
    posts = posts.filter(post => post.user_id === filterUserId);
  }

  const onLike = externalOnLike || toggleLike;
  
  const handleRetweet = async (postId: string) => {
    if (!user) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      // Check if already retweeted
      const { data: existingRetweet } = await supabase
        .from('retweets')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      if (existingRetweet) {
        // Remove retweet
        await supabase
          .from('retweets')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
      } else {
        // Create repost entry
        await supabase
          .from('retweets')
          .insert([{ user_id: user.id, post_id: postId }]);
      }

      // Call the original retweet function to update counts
      if (toggleRetweet) {
        toggleRetweet(postId);
      }
    } catch (error) {
      console.error('Error handling repost:', error);
    }
  };

  const onRetweet = externalOnRetweet || handleRetweet;
  const onPin = externalOnPin || togglePin;
  const onDelete = externalOnDelete || deletePost;

  // Real-time notification for new posts
  useEffect(() => {
    if (!user || externalPosts) return; // Only for main feed, not profile pages

    const channel = supabase
      .channel('new-posts-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      }, async (payload) => {
        const newPost = payload.new;
        
        // Don't show notification for user's own posts
        if (newPost.user_id === user.id) return;

        // Fetch the author's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name')
          .eq('id', newPost.user_id)
          .single();

        if (profile) {
          const authorName = profile.display_name || profile.username || 'Someone';
          setNewPostNotification(`${authorName} just posted!`);
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            setNewPostNotification(null);
          }, 5000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, externalPosts]);

  // Fetch retweet information for posts
  useEffect(() => {
    const fetchRetweetInfo = async () => {
      if (!posts || posts.length === 0 || !user) return;
      
      const retweetInfo: {[key: string]: any} = {};
      const postIds = posts.map(post => post.id);
      
      try {
        // Get all retweets for these posts
        const { data: retweetsData } = await supabase
          .from('retweets')
          .select(`
            post_id,
            user_id,
            profiles:user_id (
              username,
              display_name
            )
          `)
          .in('post_id', postIds);

        if (retweetsData) {
          retweetsData.forEach(retweet => {
            if (retweet.user_id === user.id) {
              retweetInfo[retweet.post_id] = {
                retweetedBy: user,
                isCurrentUser: true
              };
            } else if (!retweetInfo[retweet.post_id]) {
              retweetInfo[retweet.post_id] = {
                retweetedBy: retweet.profiles,
                isCurrentUser: false
              };
            }
          });
        }
      } catch (error) {
        console.error('Error fetching retweet info:', error);
      }
      
      setRetweetedBy(retweetInfo);
    };

    fetchRetweetInfo();
  }, [posts, user]);

  const handleCommentClick = (postId: string) => {
    setCommentsOpen(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const closeComments = (postId: string) => {
    setCommentsOpen(prev => ({ ...prev, [postId]: false }));
  };

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
      {/* New post notification */}
      {newPostNotification && (
        <div className="sticky top-0 z-50 mx-4 mb-4">
          <div className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-top duration-300">
            <p className="text-sm font-medium">{newPostNotification}</p>
          </div>
        </div>
      )}

      {posts.map((post) => {
        const isVerified = getVerifiedStatus(post.profiles);
        const isThread = isThreadPost(post.content);
        const hasAudio = hasAudioContent(post.content);
        const retweetInfo = retweetedBy[post.id];
        
        return (
          <div key={post.id}>
            <Card 
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
                      {retweetInfo.isCurrentUser 
                        ? 'You reposted' 
                        : `@${retweetInfo.retweetedBy?.username || retweetInfo.retweetedBy?.display_name || 'someone'} reposted`
                      }
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
                        onComment={() => handleCommentClick(post.id)}
                        isOwnPost={user?.id === post.user_id}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <PostComments
              postId={post.id}
              isOpen={commentsOpen[post.id] || false}
              onClose={() => closeComments(post.id)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PostsList;
