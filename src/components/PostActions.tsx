
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MessageCircle, 
  Repeat, 
  Share, 
  Pin, 
  MoreHorizontal, 
  Trash2,
  Megaphone,
  Flag
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import BoostPostDialog from './BoostPostDialog';
import ReportPostDialog from './ReportPostDialog';
import { useBusinessPages } from '@/hooks/useBusinessPages';

interface PostActionsProps {
  postId: string;
  userId: string;
  likesCount: number;
  retweetsCount: number;
  repliesCount: number;
  userLiked?: boolean;
  userRetweeted?: boolean;
  userPinned?: boolean;
  onLike: () => void;
  onRetweet: () => void;
  onPin: () => void;
  onDelete: () => void;
  onComment: () => void;
  onShare: () => void;
  isOwnPost: boolean;
}

export const PostActions = ({
  postId,
  userId,
  likesCount,
  retweetsCount,
  repliesCount,
  userLiked,
  userRetweeted,
  userPinned,
  onLike,
  onRetweet,
  onPin,
  onDelete,
  onComment,
  onShare,
  isOwnPost
}: PostActionsProps) => {
  const { myPages } = useBusinessPages();

  const hasBusinessPages = myPages && myPages.length > 0;

  return (
    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center space-x-1">
        {/* Like Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onLike}
          className={`hover:bg-red-50 dark:hover:bg-red-900/20 ${
            userLiked ? 'text-red-500 hover:text-red-600' : 'text-slate-500 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 mr-1 ${userLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{likesCount}</span>
        </Button>

        {/* Comment Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onComment}
          className="text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          <span className="text-sm">{repliesCount}</span>
        </Button>

        {/* Retweet Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRetweet}
          className={`hover:bg-green-50 dark:hover:bg-green-900/20 ${
            userRetweeted ? 'text-green-500 hover:text-green-600' : 'text-slate-500 hover:text-green-500'
          }`}
        >
          <Repeat className="w-4 h-4 mr-1" />
          <span className="text-sm">{retweetsCount}</span>
        </Button>

        {/* Share Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onShare}
          className="text-slate-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <Share className="w-4 h-4" />
        </Button>
      </div>

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Pin/Unpin - only for own posts */}
          {isOwnPost && (
            <DropdownMenuItem onClick={onPin}>
              <Pin className="w-4 h-4 mr-2" />
              {userPinned ? 'Unpin' : 'Pin'} Post
            </DropdownMenuItem>
          )}

          {/* Boost Post - only for own posts with business pages */}
          {isOwnPost && hasBusinessPages && (
            <BoostPostDialog
              postId={postId}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Megaphone className="w-4 h-4 mr-2" />
                  Boost Post
                </DropdownMenuItem>
              }
            />
          )}

          {/* Report Post - only for others' posts */}
          {!isOwnPost && (
            <ReportPostDialog
              postId={postId}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Flag className="w-4 h-4 mr-2" />
                  Report Post
                </DropdownMenuItem>
              }
            />
          )}

          {/* Delete - only for own posts */}
          {isOwnPost && (
            <DropdownMenuItem onClick={onDelete} className="text-red-600 dark:text-red-400">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Post
            </DropdownMenuItem>
            )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PostActions;
