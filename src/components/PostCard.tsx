
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Flag, Pin, Megaphone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BoostPostWidget from './BoostPostWidget';
import RetweetIndicator from './RetweetIndicator';
import { useBusinessPages } from '@/hooks/useBusinessPages';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_urls?: string[];
    video_url?: string;
    created_at: string;
    likes_count: number;
    retweets_count: number;
    replies_count: number;
    views_count: number;
    user_id: string;
    profiles?: {
      id: string;
      username: string;
      display_name: string;
      avatar_url?: string;
      is_verified?: boolean;
    };
  };
  isLiked?: boolean;
  isRetweeted?: boolean;
  retweetedBy?: any[];
  onLike?: () => void;
  onRetweet?: () => void;
  onReply?: () => void;
  onPin?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onTrackView?: (postId: string) => void;
}

const PostCard = ({ 
  post, 
  isLiked, 
  isRetweeted, 
  retweetedBy = [],
  onLike, 
  onRetweet, 
  onReply, 
  onPin, 
  onDelete, 
  onShare, 
  onTrackView 
}: PostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { myPages } = useBusinessPages();
  const [isPinned, setIsPinned] = useState(false);
  
  const isOwnPost = user?.id === post.user_id;
  const hasBusinessPages = myPages && myPages.length > 0;

  const handlePin = async () => {
    if (!user) return;
    
    try {
      if (isPinned) {
        const { error } = await supabase
          .from('pinned_posts')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);
        
        if (error) throw error;
        setIsPinned(false);
        toast({ title: "Post unpinned" });
      } else {
        const { error } = await supabase
          .from('pinned_posts')
          .insert({ user_id: user.id, post_id: post.id });
        
        if (error) throw error;
        setIsPinned(true);
        toast({ title: "Post pinned" });
      }
      
      if (onPin) onPin(post.id);
    } catch (error) {
      console.error('Error pinning post:', error);
      toast({ title: "Error", description: "Failed to pin post", variant: "destructive" });
    }
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
                {post.profiles?.is_verified && (
                  <Badge variant="secondary" className="text-xs">✓</Badge>
                )}
                <span className="text-sm text-gray-500">
                  @{post.profiles?.username}
                </span>
                <span className="text-sm text-gray-500">·</span>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {isOwnPost && (
                    <DropdownMenuItem onClick={handlePin}>
                      <Pin className="w-4 h-4 mr-2" />
                      {isPinned ? 'Unpin' : 'Pin'} Post
                    </DropdownMenuItem>
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
              <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {post.content}
              </p>
              
              {post.image_urls && post.image_urls.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 max-w-lg">
                  {post.image_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt=""
                      className="rounded-lg object-cover w-full h-48"
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
                onClick={onReply}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{post.replies_count}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetweet}
                disabled={isOwnPost}
                className={`flex items-center space-x-2 ${
                  isOwnPost 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : isRetweeted 
                    ? 'text-green-500' 
                    : 'text-gray-500 hover:text-green-500'
                }`}
              >
                <Repeat2 className="w-4 h-4" />
                <span>{post.retweets_count}</span>
              </Button>
              
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
              
              {/* Show boost button for own posts with business pages */}
              {isOwnPost && hasBusinessPages && (
                <BoostPostWidget 
                  postId={post.id} 
                  businessPageId={myPages?.[0]?.id} 
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
