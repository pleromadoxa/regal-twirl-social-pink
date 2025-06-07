
import { useState } from "react";
import { usePosts } from "@/hooks/usePosts";
import PostComments from "./PostComments";
import PostActions from "./PostActions";
import PostIndicators from "./PostIndicators";
import PostMediaDisplay from "./PostMediaDisplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import ReportPostDialog from "./ReportPostDialog";

const PostsList = () => {
  const { posts, loading, deletePost, toggleLike, toggleRetweet, togglePin } = usePosts();
  const { user } = useAuth();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleDeletePost = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(postId);
    }
  };

  const handleReportPost = (postId: string) => {
    setReportPostId(postId);
    setReportDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-6">
      {posts.map((post) => (
        <Card key={post.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="w-12">
                <Avatar className="ring-2 ring-purple-300 dark:ring-purple-500 hover:ring-pink-400 dark:hover:ring-pink-400 transition-all duration-300 cursor-pointer hover:scale-110">
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 text-white font-semibold">
                    {post.profiles?.display_name?.[0] || post.profiles?.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                        {post.profiles?.display_name || post.profiles?.username || 'Unknown User'}
                      </h3>
                      {post.profiles?.is_verified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                      {post.user_pinned && (
                        <Pin className="w-4 h-4 text-purple-500" />
                      )}
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                      @{post.profiles?.username || 'unknown'}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-sm">·</span>
                    <span className="text-slate-400 dark:text-slate-500 text-sm hover:text-purple-500 transition-colors cursor-pointer">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {user && user.id === post.user_id ? (
                        <>
                          <DropdownMenuItem
                            onClick={() => togglePin(post.id)}
                            className="cursor-pointer"
                          >
                            {post.user_pinned ? 'Unpin post' : 'Pin post'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeletePost(post.id)}
                            className="cursor-pointer text-red-600 hover:text-red-700"
                          >
                            Delete post
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleReportPost(post.id)}
                          className="cursor-pointer text-red-600 hover:text-red-700"
                        >
                          Report post
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-3">
                  <p className="text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                  
                  {/* Media Display */}
                  <PostMediaDisplay imageUrls={post.image_urls || []} />
                </div>
                
                <PostIndicators 
                  premium_tier={post.profiles?.premium_tier || 'free'}
                  posted_as_page={post.posted_as_page}
                />
                
                <PostActions
                  post={post}
                  onLike={() => toggleLike(post.id)}
                  onRetweet={() => toggleRetweet(post.id)}
                  onComment={() => setSelectedPostId(post.id)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <PostComments
        postId={selectedPostId || ''}
        isOpen={!!selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />

      <ReportPostDialog
        isOpen={reportDialogOpen}
        onClose={() => {
          setReportDialogOpen(false);
          setReportPostId(null);
        }}
        postId={reportPostId}
      />
    </div>
  );
};

export default PostsList;
