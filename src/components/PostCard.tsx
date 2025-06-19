
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { PostActions } from '@/components/PostActions';
import { PostIndicators } from '@/components/PostIndicators';
import VerificationBadge from '@/components/VerificationBadge';
import UserLink from '@/components/UserLink';
import ThreadContent from './ThreadContent';
import RetweetIndicator from './RetweetIndicator';
import SponsoredIndicator from './SponsoredIndicator';
import { getVerificationLevel, isThreadPost, hasAudioContent } from '@/utils/postUtils';
import { Post } from '@/hooks/usePosts';

interface PostCardProps {
  post: Post;
  user: any;
  retweetUsers: {[key: string]: any[]};
  sponsoredPosts: {[key: string]: any};
  businessPages: {[key: string]: any};
  onLike: (postId: string) => void;
  onRetweet: (postId: string) => void;
  onPin: (postId: string) => void;
  onDelete: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onImageClick: (images: string[], index: number) => void;
}

const PostCard = ({
  post,
  user,
  retweetUsers,
  sponsoredPosts,
  businessPages,
  onLike,
  onRetweet,
  onPin,
  onDelete,
  onComment,
  onShare,
  onImageClick
}: PostCardProps) => {
  const verificationLevel = getVerificationLevel(post.profiles);
  const isThread = isThreadPost(post.content);
  const hasAudio = hasAudioContent(post.content);
  const businessPage = post.posted_as_page ? businessPages[post.posted_as_page] : null;

  return (
    <Card 
      className={`hover:shadow-xl transition-all duration-500 relative z-20 border border-slate-200 dark:border-slate-700 ${
        isThread 
          ? 'bg-gradient-to-br from-white/95 via-purple-50/80 to-pink-50/80 dark:from-slate-800/95 dark:via-purple-900/30 dark:to-pink-900/20 backdrop-blur-xl border-purple-200/50 dark:border-purple-700/50 shadow-lg' 
          : 'bg-white dark:bg-slate-800'
      }`}
    >
      <CardContent className="p-6 relative z-30">
        {/* Sponsored Post Indicator */}
        <SponsoredIndicator sponsoredInfo={sponsoredPosts[post.id]} />
        
        {/* Enhanced Retweet indicator */}
        <RetweetIndicator users={retweetUsers[post.id]} currentUserId={user?.id} />
        
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
                <ThreadContent content={post.content} />
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
                    onClick={() => onImageClick(post.image_urls, index)}
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
                onComment={() => onComment(post.id)}
                onShare={() => onShare(post.id)}
                isOwnPost={user?.id === post.user_id}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
