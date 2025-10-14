
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Flag, Pin, Bookmark, Megaphone, Users, Activity, Music, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useVerifiedStatus } from '@/hooks/useVerifiedStatus';
import BoostPostWidget from './BoostPostWidget';
import RetweetIndicator from './RetweetIndicator';
import SponsoredIndicator from './SponsoredIndicator';
import VerificationBadge from './VerificationBadge';
import PostComments from './PostComments';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { usePinnedPosts } from '@/hooks/usePinnedPosts';
import ThreadContent from './ThreadContent';
import ImageViewer from './ImageViewer';
import UserBlockMuteMenu from './UserBlockMuteMenu';
import PollComponent from './PollComponent';
import CollaborationManager from './CollaborationManager';
import CollaboratorsDisplay from './CollaboratorsDisplay';
import { useCollaboration } from '@/hooks/useCollaboration';
import QuoteTweetDialog from './QuoteTweetDialog';
import { usePosts } from '@/hooks/usePosts';
import UserMoodDisplay from './UserMoodDisplay';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_urls?: string[];
    video_url?: string;
    created_at: string;
    updated_at?: string;
    likes_count: number;
    retweets_count: number;
    replies_count: number;
    views_count: number;
    trending_score?: number;
    user_id: string;
    quoted_post?: {
      id: string;
      content: string;
      image_urls?: string[];
      created_at: string;
      profiles?: {
        id: string;
        username: string;
        display_name: string;
        avatar_url?: string;
        verification_level?: string;
      };
      business_pages?: {
        page_name: string;
        page_avatar_url?: string;
      };
    } | null;
    metadata?: any;
    profiles?: {
      id: string;
      username: string;
      display_name: string;
      avatar_url?: string;
      is_verified?: boolean;
      verification_level?: string;
      premium_tier?: string;
    };
  };
  isLiked?: boolean;
  isRetweeted?: boolean;
  isBookmarked?: boolean;
  isSponsored?: boolean;
  sponsoredBy?: string;
  retweetedBy?: any[];
  onLike?: () => void;
  onRetweet?: () => void;
  onReply?: () => void;
  onPin?: (postId: string) => void;
  onBookmark?: () => void;
  onDelete?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onTrackView?: (postId: string) => void;
}

const PostCard = ({ 
  post, 
  isLiked, 
  isRetweeted, 
  isBookmarked,
  isSponsored,
  sponsoredBy,
  retweetedBy = [],
  onLike, 
  onRetweet, 
  onReply, 
  onPin, 
  onBookmark,
  onDelete, 
  onShare, 
  onTrackView 
}: PostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { myPages } = useBusinessPages();
  const { isPostPinned, togglePin } = usePinnedPosts();
  const { verificationLevel } = useVerifiedStatus(post.profiles);
  const { getPostCollaborators } = useCollaboration();
  const { createPost } = usePosts();
  const [showComments, setShowComments] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [showQuoteTweetDialog, setShowQuoteTweetDialog] = useState(false);
  
  const isOwnPost = user?.id === post.user_id;
  const hasBusinessPages = myPages && myPages.length > 0;
  
  // Only show promote button for posts from professional pages
  const isProfessionalPost = post.profiles?.premium_tier === 'professional';

  const handlePin = async () => {
    await togglePin(post.id);
    if (onPin) onPin(post.id);
  };

  const handleReport = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('post_reports')
        .insert({
          post_id: post.id,
          reporter_id: user.id,
          reason: 'inappropriate_content'
        });
      
      if (error) throw error;
      toast({ title: "Post reported", description: "Thank you for keeping our community safe" });
    } catch (error) {
      console.error('Error reporting post:', error);
      toast({ title: "Error", description: "Failed to report post", variant: "destructive" });
    }
  };

  const handleShare = () => {
    if (onShare) onShare(post.id);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(post.id);
  };

  const handleRetweet = () => {
    // Prevent users from retweeting their own posts
    if (isOwnPost) {
      toast({ 
        title: "Cannot re-share", 
        description: "You cannot re-share your own post",
        variant: "destructive" 
      });
      return;
    }
    if (onRetweet) onRetweet();
  };

  const handleQuoteTweet = async (content: string, quotedPostId: string) => {
    try {
      await createPost(content, [], 'personal', undefined, quotedPostId);
      toast({
        title: "Success",
        description: "Quote tweet posted successfully"
      });
    } catch (error) {
      console.error('Error creating quote tweet:', error);
      toast({
        title: "Error",
        description: "Failed to create quote tweet",
        variant: "destructive"
      });
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageViewer(true);
  };

  const fetchCollaborators = async () => {
    const collabs = await getPostCollaborators(post.id);
    setCollaborators(collabs);
  };

  useEffect(() => {
    fetchCollaborators();
  }, [post.id]);

  return (
    <Card className="mb-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        {/* Re-share indicator */}
        <RetweetIndicator 
          users={retweetedBy} 
          currentUserId={user?.id}
          postAuthorId={post.user_id}
        />
        
        <div className="flex items-start space-x-3">
          <Link to={`/profile/${post.profiles?.id}`}>
            <Avatar className="w-12 h-12">
              <AvatarImage src={post.profiles?.avatar_url} />
              <AvatarFallback>
                {post.profiles?.display_name?.[0] || post.profiles?.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link to={`/profile/${post.profiles?.id}`} className="hover:underline">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                 {post.profiles?.display_name || post.profiles?.username}
                   </span>
                 </Link>
                 <VerificationBadge 
                   level={verificationLevel} 
                   showText={false}
                   className="ml-1"
                 />
                {isPostPinned(post.id) && (
                  <div title="Pinned Post">
                    <Pin className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <span className="text-sm text-gray-500">
                  @{post.profiles?.username}
                </span>
                <span className="text-sm text-gray-500">·</span>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
                {/* Sponsored Indicator */}
                {isSponsored && (
                  <>
                    <span className="text-sm text-gray-500">·</span>
                    <SponsoredIndicator sponsoredBy={sponsoredBy} />
                  </>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user && (
                    <>
                      <DropdownMenuItem onClick={handlePin}>
                        <Pin className={`w-4 h-4 mr-2 ${isPostPinned(post.id) ? 'text-blue-600' : ''}`} />
                        {isPostPinned(post.id) ? 'Unpin' : 'Pin'} Post
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onBookmark}>
                        <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current text-blue-600' : ''}`} />
                        {isBookmarked ? 'Remove Bookmark' : 'Bookmark'} Post
                      </DropdownMenuItem>
                    </>
                  )}
                  {isOwnPost ? (
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                      <Flag className="w-4 h-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  ) : (
                    <UserBlockMuteMenu 
                      userId={post.user_id}
                      username={post.profiles?.username}
                      asMenuItems
                    />
                  )}
                  {!isOwnPost && (
                    <DropdownMenuItem onClick={handleReport}>
                      <Flag className="w-4 h-4 mr-2" />
                      Report Post
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="mt-2">
              {/* Quoted Post Display */}
              {post.quoted_post && (
                <div className="mb-3 p-3 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage 
                        src={post.quoted_post.business_pages?.page_avatar_url || post.quoted_post.profiles?.avatar_url} 
                      />
                      <AvatarFallback>
                        {(post.quoted_post.business_pages?.page_name || post.quoted_post.profiles?.display_name || 'U')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm truncate">
                          {post.quoted_post.business_pages?.page_name || post.quoted_post.profiles?.display_name || 'Unknown'}
                        </span>
                        <VerificationBadge level={post.quoted_post.profiles?.verification_level as any} />
                        <span className="text-muted-foreground text-sm">
                          @{post.quoted_post.profiles?.username || 'unknown'}
                        </span>
                        <span className="text-muted-foreground text-sm">·</span>
                        <span className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(post.quoted_post.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{post.quoted_post.content}</p>
                      {post.quoted_post.image_urls && post.quoted_post.image_urls.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {post.quoted_post.image_urls.slice(0, 4).map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt="Quoted post attachment"
                              className="rounded-lg w-full h-32 object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Mood Board Display */}
              {post.metadata?.type === 'mood_board' && post.metadata.mood && (
                <div className="mb-4">
                  <div 
                    className="relative p-4 rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${post.metadata.color_theme}20, ${post.metadata.color_theme}08)`,
                      borderColor: `${post.metadata.color_theme}40`
                    }}
                  >
                    {/* Animated gradient orb */}
                    <div 
                      className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 animate-float"
                      style={{ background: post.metadata.color_theme }}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl drop-shadow-sm">{post.metadata.emoji}</span>
                        <span className="font-semibold text-base">{post.metadata.mood}</span>
                      </div>
                      
                      {post.metadata.custom_message && (
                        <p className="text-sm text-muted-foreground mb-3 bg-background/50 rounded-lg p-2 backdrop-blur-sm">
                          {post.metadata.custom_message}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {post.metadata.activity && (
                          <Badge variant="secondary" className="text-xs bg-background/60 backdrop-blur-sm">
                            <Activity className="w-3 h-3 mr-1" />
                            {post.metadata.activity}
                          </Badge>
                        )}
                        {post.metadata.music_track && (
                          <Badge variant="secondary" className="text-xs bg-background/60 backdrop-blur-sm">
                            <Music className="w-3 h-3 mr-1" />
                            {post.metadata.music_track}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-gray-900 dark:text-gray-100">
                <ThreadContent content={post.content} />
              </div>
              
              {/* Poll Component */}
              <PollComponent postId={post.id} />
              
              {post.image_urls && post.image_urls.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 max-w-lg">
                  {post.image_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt=""
                      className="rounded-lg object-cover w-full h-48 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleImageClick(index)}
                    />
                  ))}
                </div>
              )}
              
              {post.video_url && (
                <div className="mt-3 max-w-lg">
                  <video
                    src={post.video_url}
                    controls
                    className="rounded-lg w-full"
                  />
                </div>
              )}
            </div>
            
            <div className="mt-4 flex items-center justify-between max-w-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{post.replies_count}</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isOwnPost}
                    className={`flex items-center space-x-2 ${
                      isOwnPost 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : isRetweeted 
                        ? 'text-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                    } transition-colors rounded-full px-3 py-1`}
                    title={isOwnPost ? "Cannot re-share your own post" : isRetweeted ? "Remove re-share" : "Re-share post"}
                  >
                    <Repeat2 className="w-4 h-4" />
                    <span>{post.retweets_count}</span>
                  </Button>
                </DropdownMenuTrigger>
                {!isOwnPost && (
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleRetweet}>
                      <Repeat2 className="w-4 h-4 mr-2" />
                      {isRetweeted ? 'Undo Repost' : 'Repost'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowQuoteTweetDialog(true)}>
                      <Quote className="w-4 h-4 mr-2" />
                      ReQuote
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onLike}
                className={`flex items-center space-x-2 ${
                  isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes_count}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
              >
                <Share className="w-4 h-4" />
              </Button>
              
               {/* Show boost button only for professional page posts */}
               {isProfessionalPost && hasBusinessPages && (
                 <BoostPostWidget 
                   postId={post.id} 
                   businessPageId={myPages?.[0]?.id} 
                 />
                )}
              </div>

              {/* Collaborators Display */}
              {collaborators.length > 0 && (
                <div className="mt-3 pt-3 border-t border-purple-200/50 dark:border-purple-800/50">
                  <CollaboratorsDisplay 
                    collaborators={collaborators} 
                    compact={true}
                    maxDisplay={3}
                  />
                </div>
              )}

              {/* Collaboration Manager for post owner */}
              {isOwnPost && (
                <div className="mt-3 pt-3 border-t border-purple-200/50 dark:border-purple-800/50">
                  <CollaborationManager
                    postId={post.id}
                    collaborators={collaborators}
                    onCollaboratorsUpdate={fetchCollaborators}
                    trigger={
                      <Button variant="outline" size="sm" className="w-full">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Collaborators
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
        </div>
      </CardContent>
      
      {/* Comments Modal */}
      <PostComments 
        postId={post.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
      
      {/* Image Viewer Modal */}
      {post.image_urls && (
        <ImageViewer
          images={post.image_urls}
          isOpen={showImageViewer}
          onClose={() => setShowImageViewer(false)}
          initialIndex={selectedImageIndex}
        />
      )}

      {/* Quote Tweet Dialog */}
      <QuoteTweetDialog
        post={post}
        open={showQuoteTweetDialog}
        onOpenChange={setShowQuoteTweetDialog}
        onQuoteTweet={handleQuoteTweet}
      />
    </Card>
  );
};

export default PostCard;
