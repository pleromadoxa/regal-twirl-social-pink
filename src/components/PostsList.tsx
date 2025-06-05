
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Verified, Edit, Trash, Link, VolumeX, UserX, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePosts, Post } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const PostsList = () => {
  const { posts, loading, toggleLike, toggleRetweet, deletePost } = usePosts();
  const { user } = useAuth();
  const { toast } = useToast();

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  const handleShare = (post: Post) => {
    navigator.clipboard.writeText(`"${post.content}" - @${post.profiles?.username || 'user'}`);
    toast({
      description: "Post copied to clipboard!",
      duration: 2000,
    });
  };

  const handleCopyLink = (post: Post) => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    toast({
      description: "Post link copied to clipboard!",
      duration: 2000,
    });
  };

  const handleMuteUser = (post: Post) => {
    toast({
      description: `Muted @${post.profiles?.username}`,
      duration: 2000,
    });
  };

  const handleBlockUser = (post: Post) => {
    toast({
      description: `Blocked @${post.profiles?.username}`,
      duration: 2000,
    });
  };

  const handleReportPost = (post: Post) => {
    toast({
      description: "Post reported. Thank you for helping keep our community safe.",
      duration: 3000,
    });
  };

  const handleEditPost = (post: Post) => {
    toast({
      description: "Edit functionality coming soon!",
      duration: 2000,
    });
  };

  const renderPostContent = (content: string) => {
    return content.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span
            key={index}
            className="text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 cursor-pointer font-medium transition-all duration-300 hover:scale-110 inline-block"
          >
            {word}{' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-purple-200 dark:divide-purple-700">
      {posts.map((post) => (
        <ContextMenu key={post.id}>
          <ContextMenuTrigger asChild>
            <Card className="rounded-none border-0 shadow-none hover:bg-gradient-to-r hover:from-purple-50/80 hover:to-pink-50/60 dark:hover:from-purple-900/60 dark:hover:to-pink-900/40 transition-all duration-500 cursor-pointer group bg-white/40 dark:bg-slate-900/40 hover:scale-[1.02] hover:shadow-xl">
              <div className="p-6">
                <div className="flex space-x-4">
                  <Avatar className="ring-2 ring-purple-300 dark:ring-purple-500 transition-all duration-500 group-hover:ring-pink-400 dark:group-hover:ring-pink-400 group-hover:scale-110 shadow-lg group-hover:shadow-2xl">
                    <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 text-white font-semibold">
                      {post.profiles?.display_name?.charAt(0) || post.profiles?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                        {post.profiles?.display_name || post.profiles?.username || 'Anonymous'}
                      </h3>
                      {post.profiles?.is_verified && (
                        <Verified className="w-4 h-4 text-blue-500 fill-current animate-pulse" />
                      )}
                      <span className="text-slate-500 dark:text-slate-400 text-sm">@{post.profiles?.username || 'user'}</span>
                      <span className="text-slate-400 dark:text-slate-500">·</span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">{formatTimeAgo(post.created_at)}</span>
                      <Button variant="ghost" size="sm" className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-500 p-1 hover:bg-purple-100 dark:hover:bg-purple-700 rounded-full hover:scale-125 hover:rotate-180">
                        <MoreHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </Button>
                    </div>
                    
                    <p className="mt-3 text-slate-900 dark:text-slate-100 leading-relaxed text-lg">
                      {renderPostContent(post.content)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-6 max-w-md">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 -ml-2 transition-all duration-300 hover:scale-125 hover:-translate-y-1 rounded-full"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">{post.replies_count}</span>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:scale-125 hover:rotate-180 rounded-full ${post.user_retweeted ? 'text-purple-600 dark:text-purple-400' : ''}`}
                        onClick={() => user && toggleRetweet(post.id)}
                        disabled={!user}
                      >
                        <Repeat2 className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">{post.retweets_count}</span>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full ${post.user_liked ? 'text-rose-600 dark:text-rose-400' : ''}`}
                        onClick={() => user && toggleLike(post.id)}
                        disabled={!user}
                      >
                        <Heart className={`w-5 h-5 mr-2 transition-all duration-300 ${post.user_liked ? 'fill-current scale-125 animate-bounce' : ''}`} />
                        <span className="text-sm font-medium">{post.likes_count}</span>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300 hover:scale-125 hover:-rotate-12 rounded-full"
                        onClick={() => handleShare(post)}
                      >
                        <Share className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </ContextMenuTrigger>
          
          <ContextMenuContent className="w-64">
            {user?.id === post.user_id && (
              <>
                <ContextMenuItem onClick={() => handleEditPost(post)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit post
                </ContextMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <ContextMenuItem className="text-red-600 dark:text-red-400">
                      <Trash className="w-4 h-4 mr-2" />
                      Delete post
                    </ContextMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete post</AlertDialogTitle>
                      <AlertDialogDescription>
                        This can't be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deletePost(post.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <ContextMenuSeparator />
              </>
            )}
            
            <ContextMenuItem onClick={() => handleCopyLink(post)}>
              <Link className="w-4 h-4 mr-2" />
              Copy link to post
            </ContextMenuItem>
            
            {user?.id !== post.user_id && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => handleMuteUser(post)}>
                  <VolumeX className="w-4 h-4 mr-2" />
                  Mute @{post.profiles?.username}
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleBlockUser(post)}>
                  <UserX className="w-4 h-4 mr-2" />
                  Block @{post.profiles?.username}
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleReportPost(post)} className="text-red-600 dark:text-red-400">
                  <Flag className="w-4 h-4 mr-2" />
                  Report post
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
      ))}
      
      {posts.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          No posts yet. Be the first to share something!
        </div>
      )}
    </div>
  );
};

export default PostsList;
