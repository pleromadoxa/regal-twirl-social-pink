import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Send, Image as ImageIcon, MoreVertical, Edit, Trash } from 'lucide-react';
import { useCirclePosts } from '@/hooks/useCirclePosts';
import { formatDistanceToNow } from 'date-fns';
import CirclePostReplies from './CirclePostReplies';
import { useAuth } from '@/contexts/AuthContext';
import ParsedText from './ParsedText';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CircleFeedProps {
  circleId: string;
  circleName: string;
}

const CircleFeed = ({ circleId, circleName }: CircleFeedProps) => {
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const { posts, loading, createPost, likePost, updatePost, deletePost } = useCirclePosts(circleId);
  const { user } = useAuth();

  const handleEditPost = (postId: string, currentContent: string) => {
    setEditingPostId(postId);
    setEditContent(currentContent);
  };

  const handleSaveEdit = async () => {
    if (!editingPostId || !editContent.trim()) return;
    await updatePost(editingPostId, editContent);
    setEditingPostId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent('');
  };

  const handleDeletePost = async () => {
    if (!deletePostId) return;
    await deletePost(deletePostId);
    setDeletePostId(null);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    setIsPosting(true);
    await createPost(newPost);
    setNewPost('');
    setIsPosting(false);
  };

  const toggleReplies = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      <Card className="border-primary/10 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                {user?.user_metadata?.display_name?.[0] || user?.email?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">Share with {circleName}</h3>
              <p className="text-xs text-muted-foreground">What's on your mind?</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Share your thoughts, updates, or memories with the circle... Use @username to mention someone or #hashtag to tag topics"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[120px] resize-none border-muted-foreground/20 focus:border-primary"
          />
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Add Image
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={!newPost.trim() || isPosting}
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Send className="w-4 h-4 mr-2" />
              {isPosting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Be the first to share something with this circle! Start a conversation, share an update, or post a memory.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="border-muted-foreground/10 hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                      <AvatarImage src={post.profiles?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        {post.profiles?.display_name?.[0] || post.profiles?.username?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {post.profiles?.display_name || post.profiles?.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        {post.updated_at !== post.created_at && ' (edited)'}
                      </p>
                    </div>
                  </div>

                  {/* Post Actions Menu - Only for post author */}
                  {user?.id === post.author_id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPost(post.id, post.content)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit post
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletePostId(post.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingPostId === post.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                    <ParsedText text={post.content} />
                  </div>
                )}
                
                {/* Actions Bar */}
                <div className="flex items-center gap-2 pt-3 border-t border-muted-foreground/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likePost(post.id)}
                    className="text-muted-foreground hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/20 transition-colors"
                  >
                    <Heart className="w-4 h-4 mr-1.5" />
                    <span className="text-sm font-medium">{post.likes_count}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReplies(post.id)}
                    className={`text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors ${
                      expandedPostId === post.id ? 'bg-primary/10 text-primary' : ''
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    <span className="text-sm font-medium">
                      {post.replies_count || 0} {post.replies_count === 1 ? 'reply' : 'replies'}
                    </span>
                  </Button>
                </div>

                {/* Replies Thread */}
                <CirclePostReplies 
                  postId={post.id} 
                  isOpen={expandedPostId === post.id}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={(open) => !open && setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CircleFeed;
