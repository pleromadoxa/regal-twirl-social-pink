
import { Heart, MessageCircle, Repeat, Share, Pin, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import RepliesSection from "./RepliesSection";
import ReportPostDialog from "./ReportPostDialog";

interface PostsListProps {
  posts: Post[];
  onLike: (postId: string) => void;
  onRetweet: (postId: string) => void;
  onPin: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

const PostsList = ({ posts, onLike, onRetweet, onPin, onDelete }: PostsListProps) => {
  const { user } = useAuth();

  return (
    <div className="space-y-0">
      {posts.map((post) => (
        <Card key={post.id} className="border-0 border-b border-slate-200 dark:border-slate-700 rounded-none">
          <CardContent className="p-6">
            <div className="flex space-x-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                {post.profiles?.avatar_url ? (
                  <img
                    src={post.profiles.avatar_url}
                    alt={post.profiles.display_name || post.profiles.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                    {(post.profiles?.display_name || post.profiles?.username || 'U')[0].toUpperCase()}
                  </span>
                )}
              </div>

              {/* Post Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {post.profiles?.display_name || post.profiles?.username || 'Unknown User'}
                    </h3>
                    {post.profiles?.is_verified && (
                      <span className="text-blue-500">✓</span>
                    )}
                    <span className="text-slate-600 dark:text-slate-400">
                      @{post.profiles?.username || 'unknown'}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">·</span>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {/* More Options */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onPin(post.id)}>
                        <Pin className="w-4 h-4 mr-2" />
                        {post.user_pinned ? 'Unpin' : 'Pin'} Post
                      </DropdownMenuItem>
                      {user && post.user_id === user.id && onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(post.id)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Post
                        </DropdownMenuItem>
                      )}
                      {user && post.user_id !== user.id && (
                        <ReportPostDialog 
                          postId={post.id}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <span className="text-red-600 dark:text-red-400 flex items-center">
                                <span className="w-4 h-4 mr-2">🚩</span>
                                Report Post
                              </span>
                            </DropdownMenuItem>
                          }
                        />
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-2">
                  <p className="text-slate-900 dark:text-slate-100 text-[15px] leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between mt-4 max-w-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRetweet(post.id)}
                    className={`flex items-center space-x-2 rounded-full ${
                      post.user_retweeted
                        ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950'
                        : 'text-slate-600 dark:text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950'
                    }`}
                  >
                    <Repeat className="w-5 h-5" />
                    <span className="text-sm">{post.retweets_count || 0}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLike(post.id)}
                    className={`flex items-center space-x-2 rounded-full ${
                      post.user_liked
                        ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950'
                        : 'text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.user_liked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{post.likes_count || 0}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 rounded-full"
                  >
                    <Share className="w-5 h-5" />
                  </Button>
                </div>

                {/* Pinned Indicator */}
                {post.user_pinned && (
                  <div className="flex items-center mt-2 text-purple-600 dark:text-purple-400">
                    <Pin className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Pinned Post</span>
                  </div>
                )}

                {/* Replies Section */}
                <div className="mt-4">
                  <RepliesSection 
                    postId={post.id} 
                    initialRepliesCount={post.replies_count || 0}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PostsList;
