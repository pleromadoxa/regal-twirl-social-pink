import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { usePosts } from '@/hooks/usePosts';
import { PostActions } from '@/components/PostActions';
import { PostIndicators } from '@/components/PostIndicators';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Repeat, Share, Megaphone } from 'lucide-react';
import { VerificationLevel } from '@/hooks/useVerifiedStatus';
import VerificationBadge from '@/components/VerificationBadge';
import InlineComments from './InlineComments';
import MediaPreview from './MediaPreview';
import UserLink from './UserLink';
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

// Helper function to calculate verification status without using hooks
const getVerificationLevel = (user: any): VerificationLevel => {
  if (!user || typeof user !== 'object') return null;
  
  // Special case for VIP user
  if (user.email === 'pleromadoxa@gmail.com' || user.username === 'pleromadoxa') {
    return 'vip';
  }
  
  // Business verification (for business accounts)
  if (user.premium_tier === 'business') {
    return 'business';
  }
  
  // Professional verification (for professional accounts)
  if (user.premium_tier === 'professional') {
    return 'professional';
  }
  
  // Check if manually verified
  if (user.is_verified) {
    return 'verified';
  }
  
  // Check if has 100+ followers
  if (user.followers_count && user.followers_count >= 100) {
    return 'verified';
  }
  
  return null;
};

export const PostsList = ({ 
  posts: externalPosts, 
  onLike: externalOnLike, 
  onRetweet: externalOnRetweet, 
  onPin: externalOnPin, 
  onDelete: externalOnDelete,
  userId: filterUserId
}: PostsListProps = {}) => {
  const { posts: hookPosts, loading, toggleLike, toggleRetweet, togglePin, deletePost, refetch } = usePosts();
  const { user } = useAuth();
  const { toast } = useToast();
  const [retweetedBy, setRetweetedBy] = useState<{[key: string]: any}>({});
  const [retweetUsers, setRetweetUsers] = useState<{[key: string]: any[]}>({});
  const [commentsOpen, setCommentsOpen] = useState<{[key: string]: boolean}>({});
  const [newPostNotification, setNewPostNotification] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState<{
    isOpen: boolean;
    images: string[];
    initialIndex: number;
  }>({
    isOpen: false,
    images: [],
    initialIndex: 0
  });
  const [businessPages, setBusinessPages] = useState<{[key: string]: any}>({});
  const [sponsoredPosts, setSponsoredPosts] = useState<{[key: string]: any}>({});

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
      const { data: existingRetweet } = await supabase
        .from('retweets')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

      if (existingRetweet) {
        await supabase
          .from('retweets')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
      } else {
        await supabase
          .from('retweets')
          .insert([{ user_id: user.id, post_id: postId }]);
      }

      if (toggleRetweet) {
        toggleRetweet(postId);
      }

      // Refresh retweet info immediately
      await fetchRetweetInfo();
      
      // Also refetch posts to get updated counts
      if (refetch) {
        await refetch();
      }
    } catch (error) {
      console.error('Error handling repost:', error);
    }
  };

  const handleShare = async (postId: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post',
          url: `${window.location.origin}/post/${postId}`
        });
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        toast({
          title: "Link copied!",
          description: "Post link copied to clipboard"
        });
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const onRetweet = externalOnRetweet || handleRetweet;
  const onPin = externalOnPin || togglePin;
  const onDelete = externalOnDelete || deletePost;

  // Fetch sponsored post information
  useEffect(() => {
    const fetchSponsoredPosts = async () => {
      if (!posts || posts.length === 0) return;
      
      const postIds = posts
        .filter(post => post.sponsored_post_id)
        .map(post => post.sponsored_post_id)
        .filter(Boolean);
      
      if (postIds.length === 0) return;
      
      try {
        const { data: sponsoredData } = await supabase
          .from('sponsored_posts')
          .select(`
            id,
            post_id,
            business_page_id,
            sponsor_type,
            status,
            business_pages(
              id,
              page_name,
              page_type
            )
          `)
          .in('id', postIds);

        if (sponsoredData) {
          const sponsoredMap: {[key: string]: any} = {};
          sponsoredData.forEach(sponsored => {
            sponsoredMap[sponsored.post_id] = sponsored;
          });
          setSponsoredPosts(sponsoredMap);
        }
      } catch (error) {
        console.error('Error fetching sponsored posts:', error);
      }
    };

    fetchSponsoredPosts();
  }, [posts]);

  // Fetch business page information for posts made as professional accounts
  useEffect(() => {
    const fetchBusinessPages = async () => {
      if (!posts || posts.length === 0) return;
      
      const pageIds = posts
        .filter(post => post.posted_as_page)
        .map(post => post.posted_as_page)
        .filter(Boolean);
      
      if (pageIds.length === 0) return;
      
      try {
        const { data: pagesData } = await supabase
          .from('business_pages')
          .select('id, page_name, page_type, avatar_url, is_verified')
          .in('id', pageIds);

        if (pagesData) {
          const pagesMap: {[key: string]: any} = {};
          pagesData.forEach(page => {
            pagesMap[page.id] = page;
          });
          setBusinessPages(pagesMap);
        }
      } catch (error) {
        console.error('Error fetching business pages:', error);
      }
    };

    fetchBusinessPages();
  }, [posts]);

  // Real-time notification for new posts with auto-refresh
  useEffect(() => {
    if (!user || externalPosts) return;

    const channel = supabase
      .channel('new-posts-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      }, async (payload) => {
        const newPost = payload.new;
        
        if (newPost.user_id === user.id) {
          // If it's user's own post, refresh the feed immediately
          setTimeout(() => {
            if (refetch) refetch();
          }, 500);
          return;
        }

        // Fetch the author's profile for notification
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name')
          .eq('id', newPost.user_id)
          .maybeSingle();

        if (profile) {
          const authorName = profile.display_name || profile.username || 'Someone';
          setNewPostNotification(`${authorName} just posted!`);
          
          // Auto-hide notification and refresh after 3 seconds
          setTimeout(() => {
            setNewPostNotification(null);
            if (refetch) refetch();
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, externalPosts, refetch]);

  // Enhanced retweet information fetching
  const fetchRetweetInfo = async () => {
    if (!posts || posts.length === 0 || !user) return;
    
    const retweetInfo: {[key: string]: any} = {};
    const retweetUsersMap: {[key: string]: any[]} = {};
    const postIds = posts.map(post => post.id);
    
    try {
      const { data: retweetsData } = await supabase
        .from('retweets')
        .select(`
          post_id,
          user_id,
          created_at,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .in('post_id', postIds)
        .order('created_at', { ascending: false });

      if (retweetsData) {
        retweetsData.forEach(retweet => {
          if (!retweetUsersMap[retweet.post_id]) {
            retweetUsersMap[retweet.post_id] = [];
          }
          
          if (retweet.profiles && typeof retweet.profiles === 'object') {
            const profileData = {
              username: (retweet.profiles as any).username,
              display_name: (retweet.profiles as any).display_name,
              avatar_url: (retweet.profiles as any).avatar_url
            };
            
            retweetUsersMap[retweet.post_id].push({
              ...profileData,
              user_id: retweet.user_id,
              created_at: retweet.created_at
            });

            if (retweet.user_id === user.id) {
              retweetInfo[retweet.post_id] = {
                retweetedBy: user,
                isCurrentUser: true
              };
            } else if (!retweetInfo[retweet.post_id]) {
              retweetInfo[retweet.post_id] = {
                retweetedBy: profileData,
                isCurrentUser: false
              };
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching retweet info:', error);
    }
    
    setRetweetedBy(retweetInfo);
    setRetweetUsers(retweetUsersMap);
  };

  // Fetch retweet information for posts
  useEffect(() => {
    fetchRetweetInfo();
  }, [posts, user]);

  const handleCommentClick = (postId: string) => {
    setCommentsOpen(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const closeComments = (postId: string) => {
    setCommentsOpen(prev => ({ ...prev, [postId]: false }));
  };

  const handleImageClick = (images: string[], index: number) => {
    setMediaPreview({
      isOpen: true,
      images,
      initialIndex: index
    });
  };

  const closeMediaPreview = () => {
    setMediaPreview({
      isOpen: false,
      images: [],
      initialIndex: 0
    });
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
    if (!user || typeof user !== 'object') return false;
    
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

  const renderRetweetIndicator = (postId: string) => {
    const users = retweetUsers[postId];
    if (!users || users.length === 0) return null;

    const currentUserRetweeted = users.some(u => u.user_id === user?.id);
    const otherUsers = users.filter(u => u.user_id !== user?.id);

    if (currentUserRetweeted && otherUsers.length === 0) {
      return (
        <div className="flex items-center gap-2 text-sm mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700/50">
          <Repeat className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-300 font-medium">
            You reshared this post
          </span>
        </div>
      );
    }

    if (otherUsers.length > 0) {
      const firstUser = otherUsers[0];
      const remainingCount = otherUsers.length - 1;

      return (
        <div className="flex items-center gap-2 text-sm mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700/50">
          <Repeat className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-300 font-medium">
            {currentUserRetweeted ? 'You, ' : ''}
            @{firstUser.username || firstUser.display_name}
            {remainingCount > 0 && ` and ${remainingCount} other${remainingCount > 1 ? 's' : ''}`}
            {remainingCount >= 3 && ` (${otherUsers.length} total)`}
            {' '}reshared this post
          </span>
        </div>
      );
    }

    return null;
  };

  const renderSponsoredIndicator = (post: any) => {
    const sponsoredInfo = sponsoredPosts[post.id];
    
    if (!sponsoredInfo || sponsoredInfo.status !== 'active') {
      return null;
    }

    return (
      <div className="flex items-center gap-2 mb-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700/50">
        <Megaphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span className="text-purple-700 dark:text-purple-300 font-medium text-sm">
          Sponsored
        </span>
        {sponsoredInfo.business_pages && (
          <span className="text-purple-600 dark:text-purple-400 text-sm">
            • {sponsoredInfo.business_pages.page_name}
          </span>
        )}
        {sponsoredInfo.sponsor_type === 'boosted_post' && (
          <span className="text-purple-600 dark:text-purple-400 text-sm">
            • Boosted Post
          </span>
        )}
      </div>
    );
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
        const verificationLevel = getVerificationLevel(post.profiles);
        const isThread = isThreadPost(post.content);
        const hasAudio = hasAudioContent(post.content);
        const businessPage = post.posted_as_page ? businessPages[post.posted_as_page] : null;
        
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
                {/* Sponsored Post Indicator */}
                {renderSponsoredIndicator(post)}
                
                {/* Enhanced Retweet indicator */}
                {renderRetweetIndicator(post.id)}
                
                <PostIndicators 
                  isThread={isThread} 
                  hasAudio={hasAudio}
                  className="relative z-40"
                />
                
                <div className="flex items-start space-x-3">
                  <UserLink 
                    userId={post.user_id}
                    showAvatar={true}
                    avatarUrl={businessPage ? businessPage.avatar_url : post.profiles.avatar_url}
                    displayName={businessPage ? businessPage.page_name : post.profiles.display_name}
                    username={businessPage ? businessPage.page_name.toLowerCase().replace(/\s+/g, '') : post.profiles.username}
                    className="w-12 h-12"
                  />
                  
                  <div className="flex-1 min-w-0 relative z-40">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="flex items-center gap-2">
                        <UserLink 
                          userId={post.user_id}
                          className="font-semibold text-slate-900 dark:text-slate-100 truncate hover:underline"
                        >
                          {businessPage 
                            ? businessPage.page_name 
                            : post.profiles.display_name || post.profiles.username
                          }
                        </UserLink>
                        {businessPage?.is_verified && (
                          <VerificationBadge level="business" showText={false} />
                        )}
                        {!businessPage && verificationLevel && (
                          <VerificationBadge level={verificationLevel} showText={false} />
                        )}
                        {businessPage && (
                          <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 px-1.5 py-0.5 text-xs">
                            {businessPage.page_type}
                          </Badge>
                        )}
                      </div>
                      <UserLink 
                        userId={post.user_id}
                        className="text-slate-500 dark:text-slate-400 hover:underline"
                      >
                        @{businessPage ? businessPage.page_name.toLowerCase().replace(/\s+/g, '') : post.profiles.username}
                      </UserLink>
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
                    
                    {/* Display images with preview functionality */}
                    {post.image_urls && post.image_urls.length > 0 && (
                      <div className={`grid gap-2 mb-3 rounded-lg overflow-hidden ${
                        post.image_urls.length === 1 ? 'grid-cols-1' : 
                        post.image_urls.length === 2 ? 'grid-cols-2' : 
                        post.image_urls.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
                      }`}>
                        {post.image_urls.map((imageUrl: string, index: number) => (
                          <div 
                            key={index} 
                            className={`relative cursor-pointer group ${
                              post.image_urls.length === 3 && index === 0 ? 'col-span-2' : ''
                            }`}
                            onClick={() => handleImageClick(post.image_urls, index)}
                          >
                            <img
                              src={imageUrl}
                              alt={`Post image ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-all duration-300 group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                                Click to view
                              </div>
                            </div>
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
                        onShare={() => handleShare(post.id)}
                        isOwnPost={user?.id === post.user_id}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inline comments displayed below the post when opened */}
            <InlineComments
              postId={post.id}
              isOpen={commentsOpen[post.id] || false}
              onClose={() => closeComments(post.id)}
            />
          </div>
        );
      })}

      {/* Media Preview Modal */}
      <MediaPreview
        images={mediaPreview.images}
        initialIndex={mediaPreview.initialIndex}
        isOpen={mediaPreview.isOpen}
        onClose={closeMediaPreview}
      />
    </div>
  );
};

export default PostsList;
