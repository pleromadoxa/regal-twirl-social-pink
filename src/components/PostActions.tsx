
import { useState } from 'react';
import { Heart, MessageCircle, Repeat, Pin, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { CommentDialog } from './CommentDialog';

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
  isOwnPost
}: PostActionsProps) => {
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-6">
          {/* Comment Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(true)}
            className="text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center space-x-1 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{repliesCount}</span>
          </Button>

          {/* Retweet Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetweet}
            className={`flex items-center space-x-1 transition-colors ${
              userRetweeted
                ? 'text-green-600 hover:text-green-700 bg-green-50 dark:bg-green-900/20'
                : 'text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
          >
            <Repeat className="w-4 h-4" />
            <span className="text-sm">{retweetsCount}</span>
          </Button>

          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className={`flex items-center space-x-1 transition-colors ${
              userLiked
                ? 'text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20'
                : 'text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            <Heart className={`w-4 h-4 ${userLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likesCount}</span>
          </Button>
        </div>

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPin}>
              <Pin className="w-4 h-4 mr-2" />
              {userPinned ? 'Unpin' : 'Pin'} post
            </DropdownMenuItem>
            {isOwnPost && (
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete post
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommentDialog
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        postId={postId}
      />
    </>
  );
};
