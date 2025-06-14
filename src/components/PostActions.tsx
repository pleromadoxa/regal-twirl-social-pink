
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Repeat2, Pin, Trash2, MoreHorizontal, Flag, Share } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ReportPostDialog from './ReportPostDialog';

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
  onShare?: () => void;
  isOwnPost: boolean;
}

export const PostActions = ({
  postId,
  userId,
  likesCount,
  retweetsCount,
  repliesCount,
  userLiked = false,
  userRetweeted = false,
  userPinned = false,
  onLike,
  onRetweet,
  onPin,
  onDelete,
  onComment,
  onShare,
  isOwnPost
}: PostActionsProps) => {
  return (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
      <div className="flex items-center space-x-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className={`flex items-center space-x-2 ${
            userLiked ? 'text-red-500 hover:text-red-600' : 'text-slate-500 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${userLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{likesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onComment}
          className="flex items-center space-x-2 text-slate-500 hover:text-blue-500"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{repliesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRetweet}
          className={`flex items-center space-x-2 ${
            userRetweeted ? 'text-green-500 hover:text-green-600' : 'text-slate-500 hover:text-green-500'
          }`}
        >
          <Repeat2 className="w-4 h-4" />
          <span className="text-sm">{retweetsCount}</span>
        </Button>

        {onShare && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="flex items-center space-x-2 text-slate-500 hover:text-purple-500"
          >
            <Share className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1">
        {!isOwnPost && (
          <ReportPostDialog 
            postId={postId}
            trigger={
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Flag className="w-4 h-4" />
              </Button>
            }
          />
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwnPost && (
              <>
                <DropdownMenuItem onClick={onPin}>
                  <Pin className="w-4 h-4 mr-2" />
                  {userPinned ? 'Unpin post' : 'Pin post'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete post
                </DropdownMenuItem>
              </>
            )}
            {!isOwnPost && (
              <ReportPostDialog 
                postId={postId}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Flag className="w-4 h-4 mr-2" />
                    Report post
                  </DropdownMenuItem>
                }
              />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
