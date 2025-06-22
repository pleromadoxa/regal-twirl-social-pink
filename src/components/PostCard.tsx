
import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/hooks/usePosts';
import PostActions from './PostActions';
import PostComments from './PostComments';
import RetweetIndicator from './RetweetIndicator';
import VerificationBadge from './VerificationBadge';
import PostIndicators from './PostIndicators';
import SponsoredIndicator from './SponsoredIndicator';
import ThreadContent from './ThreadContent';
import { getVerificationLevel } from '@/utils/postUtils';
import { Eye } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onRetweet: (postId: string) => void;
  onPin: (postId: string) => void;
  onDelete: (postId: string) => void;
  onShare: (postId: string) => void;
  onTrackView?: (postId: string) => void;
  retweetedBy?: any;
  retweetUsers?: any[];
  businessPages?: {[key: string]: any};
  sponsoredInfo?: any;
}

const PostCard = ({ 
  post, 
  onLike, 
  onRetweet, 
  onPin, 
  onDelete, 
  onShare,
  onTrackView,
  retweetedBy,
  retweetUsers = [],
  businessPages = {},
  sponsoredInfo
}: PostCardProps) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const isOwnPost = user?.id === post.user_id;
  const verificationLevel = getVerificationLevel(post.profiles);
  
  // Get business page info if post was made as a page
  const businessPageInfo = post.posted_as_page ? businessPages[post.posted_as_page] : null;
  
  // Determine display info (use business page info if available, otherwise user profile)
  const displayName = businessPageInfo?.page_name || post.profiles?.display_name || post.profiles?.username || 'Unknown User';
  const username = businessPageInfo?.page_name ? `@${businessPageInfo.page_name.toLowerCase().replace(/\s+/g, '')}` : `@${post.profiles?.username || 'unknown'}`;
  const avatarUrl = businessPageInfo?.avatar_url || post.profiles?.avatar_url;
  const isVerified = businessPageInfo?.is_verified || post.profiles?.is_verified;

  // Check if this is a thread post
  const isThreadPost = post.content.includes('\n\n');

  // Track view when post becomes visible
  useEffect(() => {
    if (!hasTrackedView && onTrackView && cardRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasTrackedView) {
            onTrackView(post.id);
            setHasTrackedView(true);
          }
        },
        { threshold: 0.5 } // Track when 50% of the post is visible
      );

      observer.observe(cardRef.current);

      return () => observer.disconnect();
    }
  }, [post.id, onTrackView, hasTrackedView]);

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Card 
      ref={cardRef}
      className={`border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-200 ${isThreadPost ? 'overflow-visible' : ''}`}
    >
      <CardContent className="p-4">
        {/* Sponsored Indicator */}
        <SponsoredIndicator sponsoredInfo={sponsoredInfo} />
        
        {/* Retweet Indicator */}
        <RetweetIndicator 
          users={retweetUsers}
          currentUserId={user?.id}
        />
        
        <div className="flex space-x-3">
          <Avatar className="w-10 h-10 ring-2 ring-purple-200 dark:ring-purple-700">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-semibold">
              {displayName?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {displayName}
              </p>
              <VerificationBadge 
                level={verificationLevel}
                showText={false}
              />
              {businessPageInfo && (
                <Badge variant="secondary" className="text-xs">
                  {businessPageInfo.page_type}
                </Badge>
              )}
              <span className="text-slate-500 dark:text-slate-400 text-sm truncate">
                {username}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-sm">•</span>
              <span className="text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <PostIndicators 
                  hasAudio={!!post.audio_url}
                />
                {/* Use ThreadContent for thread posts, regular content for others */}
                {isThreadPost ? (
                  <ThreadContent content={post.content} />
                ) : (
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
                    {post.content}
                  </p>
                )}
              </div>
              
              {/* Images */}
              {post.image_urls && post.image_urls.length > 0 && (
                <div className={`grid gap-2 rounded-lg overflow-hidden ${
                  post.image_urls.length === 1 ? 'grid-cols-1' : 
                  post.image_urls.length === 2 ? 'grid-cols-2' : 
                  post.image_urls.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
                }`}>
                  {post.image_urls.slice(0, 4).map((url, index) => (
                    <div 
                      key={index} 
                      className={`relative ${
                        post.image_urls!.length === 3 && index === 0 ? 'row-span-2' : ''
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg max-h-80"
                        loading="lazy"
                      />
                      {post.image_urls!.length > 4 && index === 3 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <span className="text-white font-semibold text-lg">
                            +{post.image_urls!.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Audio */}
              {post.audio_url && (
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                  <audio controls className="w-full">
                    <source src={post.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {/* View Count */}
              <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm space-x-1">
                <Eye className="w-4 h-4" />
                <span>{formatViewCount(post.views_count || 0)} views</span>
              </div>
            </div>
            
            {/* Post Actions - Always at the bottom before comments */}
            <PostActions
              postId={post.id}
              userId={post.user_id}
              likesCount={post.likes_count}
              retweetsCount={post.retweets_count}
              repliesCount={post.replies_count}
              userLiked={post.user_liked || false}
              userRetweeted={post.user_retweeted || false}
              userPinned={post.user_pinned || false}
              onLike={() => onLike(post.id)}
              onRetweet={() => onRetweet(post.id)}
              onPin={() => onPin(post.id)}
              onDelete={() => onDelete(post.id)}
              onComment={handleComment}
              onShare={() => onShare(post.id)}
              isOwnPost={isOwnPost}
              postedAsPage={post.posted_as_page}
              userPremiumTier={post.profiles?.premium_tier}
            />
            
            {/* Comments section - Always at the very bottom */}
            {showComments && (
              <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                <PostComments 
                  postId={post.id} 
                  isOpen={showComments}
                  onClose={() => setShowComments(false)}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
