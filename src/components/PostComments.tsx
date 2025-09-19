
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  } | null;
}

interface PostCommentsProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PostComments = ({ postId, isOpen, onClose }: PostCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('replies')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!replies_user_id_fkey (
            username,
            display_name, 
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedComments = (data || []).map(comment => ({
        ...comment,
        profiles: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles
      }));

      setComments(transformedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('replies')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      
      // Trigger a custom event to update post count
      window.dispatchEvent(new CustomEvent('replyAdded', { 
        detail: { postId } 
      }));
      
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully."
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[80vh] bg-white dark:bg-slate-800 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <MessageCircle className="w-5 h-5" />
            Comments
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-sm text-slate-500 mt-2">Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.profiles?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                      {comment.profiles?.display_name?.[0] || comment.profiles?.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {comment.profiles?.display_name || comment.profiles?.username || 'Unknown User'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No comments yet</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Be the first to comment!</p>
              </div>
            )}
          </div>

          {user && (
            <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex-shrink-0 bg-white dark:bg-slate-800">
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                    {user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex space-x-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
                    disabled={submitting}
                    className="flex-1 border-slate-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400"
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                    size="sm"
                    className="px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PostComments;
