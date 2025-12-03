import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
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

interface InlinePostCommentsProps {
  postId: string;
  isOpen: boolean;
}

const InlinePostComments = ({ postId, isOpen }: InlinePostCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
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
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const transformedComments = (data || []).map(comment => ({
        ...comment,
        profiles: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles
      }));

      setComments(transformedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
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
      
      window.dispatchEvent(new CustomEvent('replyAdded', { 
        detail: { postId } 
      }));
      
      toast({
        title: "Comment posted",
        description: "Your comment has been added."
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
    <div className="overflow-hidden transition-all duration-300 ease-in-out animate-in slide-in-from-top-2">
      <div className="border-t border-border/50 bg-muted/30 p-3 space-y-3">
        {/* Comment Input */}
        {user && (
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7 flex-shrink-0">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                ref={inputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
                disabled={submitting}
                className="h-8 text-sm bg-background border-border/50 focus:border-primary/50"
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                size="sm"
                className="h-8 px-3"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Recent Comments */}
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2 text-sm">
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarImage src={comment.profiles?.avatar_url} />
                  <AvatarFallback className="text-[10px] bg-muted">
                    {comment.profiles?.display_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="font-medium text-xs">
                      {comment.profiles?.display_name || comment.profiles?.username || 'Unknown'}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 break-words">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-1">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};

export default InlinePostComments;
