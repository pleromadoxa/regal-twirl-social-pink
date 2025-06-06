
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export const CommentDialog = ({ isOpen, onClose, postId }: CommentDialogProps) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && postId) {
      fetchReplies();
    }
  }, [isOpen, postId]);

  const fetchReplies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('replies')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
      toast({
        title: "Error loading comments",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!user || !newReply.trim()) return;

    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('replies')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: newReply.trim()
          }
        ])
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setReplies(prev => [...prev, data]);
      setNewReply('');
      
      toast({
        title: "Comment posted!",
        description: "Your comment has been added successfully."
      });
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: "Error posting comment",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            </div>
          ) : replies.length > 0 ? (
            replies.map((reply) => (
              <div key={reply.id} className="flex space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={reply.profiles?.avatar_url} />
                  <AvatarFallback>
                    {reply.profiles?.display_name?.[0] || reply.profiles?.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {reply.profiles?.display_name || reply.profiles?.username || 'Unknown User'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {reply.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
        
        {user && (
          <div className="border-t pt-4 flex space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex space-x-2">
              <Textarea
                placeholder="Write a comment..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                className="flex-1 resize-none"
                rows={2}
              />
              <Button
                onClick={handleSubmitReply}
                disabled={!newReply.trim() || isSubmitting}
                size="sm"
                className="self-end"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
