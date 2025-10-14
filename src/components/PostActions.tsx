
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share, 
  Pin, 
  Bookmark,
  Trash2, 
  MoreHorizontal,
  TrendingUp,
  Megaphone,
  Quote
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import BoostPostDialog from './BoostPostDialog';
import ReportPostDialog from './ReportPostDialog';

interface PostActionsProps {
  postId: string;
  userId: string;
  likesCount: number;
  retweetsCount: number;
  repliesCount: number;
  userLiked: boolean;
  userRetweeted: boolean;
  userPinned: boolean;
  userBookmarked: boolean;
  onLike: () => void;
  onRetweet: () => void;
  onQuoteTweet?: () => void;
  onPin: () => void;
  onBookmark: () => void;
  onDelete: () => void;
  onComment: () => void;
  onShare: () => void;
  isOwnPost: boolean;
  postedAsPage?: string;
  userPremiumTier?: string;
}

const PostActions = ({
  postId,
  userId,
  likesCount,
  retweetsCount,
  repliesCount,
  userLiked,
  userRetweeted,
  userPinned,
  userBookmarked,
  onLike,
  onRetweet,
  onQuoteTweet,
  onPin,
  onBookmark,
  onDelete,
  onComment,
  onShare,
  isOwnPost,
  postedAsPage,
  userPremiumTier
}: PostActionsProps) => {
  const { user } = useAuth();
  const [showBoostDialog, setShowBoostDialog] = useState(false);

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const canShowBoostOrAds = isOwnPost && (postedAsPage || userPremiumTier === 'premium' || userPremiumTier === 'pro');

  return (
    <>
      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onComment}
            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors rounded-full p-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="ml-1 text-sm">{formatCount(repliesCount)}</span>
          </Button>
        </div>

        <div className="flex items-center space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`transition-colors rounded-full p-2 ${
                  userRetweeted 
                    ? 'text-green-600 hover:text-green-700 bg-green-50 dark:bg-green-900/20' 
                    : 'text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                }`}
              >
                <Repeat2 className="w-4 h-4" />
                <span className="ml-1 text-sm">{formatCount(retweetsCount)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={onRetweet}>
                <Repeat2 className="w-4 h-4 mr-2" />
                {userRetweeted ? 'Undo Retweet' : 'Retweet'}
              </DropdownMenuItem>
              {onQuoteTweet && (
                <DropdownMenuItem onClick={onQuoteTweet}>
                  <Quote className="w-4 h-4 mr-2" />
                  Quote Tweet
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className={`transition-colors rounded-full p-2 ${
              userLiked 
                ? 'text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20' 
                : 'text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            <Heart className={`w-4 h-4 ${userLiked ? 'fill-current' : ''}`} />
            <span className="ml-1 text-sm">{formatCount(likesCount)}</span>
          </Button>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors rounded-full p-2"
          >
            <Share className="w-4 h-4" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors rounded-full p-2"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {user && (
              <>
                <DropdownMenuItem onClick={onPin}>
                  <Pin className="w-4 h-4 mr-2" />
                  {userPinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onBookmark}>
                  <Bookmark className={`w-4 h-4 mr-2 ${userBookmarked ? 'fill-current text-blue-600' : ''}`} />
                  {userBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                </DropdownMenuItem>
              </>
            )}
            
            {canShowBoostOrAds && (
              <>
                <DropdownMenuItem onClick={() => setShowBoostDialog(true)}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Boost Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowBoostDialog(true)}>
                  <Megaphone className="w-4 h-4 mr-2" />
                  Create Ad
                </DropdownMenuItem>
              </>
            )}
            
            {isOwnPost ? (
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            ) : (
              <ReportPostDialog 
                postId={postId}
                trigger={
                  <DropdownMenuItem className="text-red-600">
                    <span className="w-4 h-4 mr-2">⚠️</span>
                    Report
                  </DropdownMenuItem>
                }
              />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {canShowBoostOrAds && (
        <BoostPostDialog
          postId={postId}
          trigger={<div style={{ display: 'none' }} />}
        />
      )}
    </>
  );
};

export default PostActions;
