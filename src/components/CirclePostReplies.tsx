import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Trash2 } from 'lucide-react';
import { useCirclePostReplies } from '@/hooks/useCirclePostReplies';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface CirclePostRepliesProps {
  postId: string;
  isOpen: boolean;
}

const CirclePostReplies = ({ postId, isOpen }: CirclePostRepliesProps) => {
  const [newReply, setNewReply] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const { replies, loading, createReply, deleteReply } = useCirclePostReplies(isOpen ? postId : undefined);
  const { user } = useAuth();

  const handleCreateReply = async () => {
    if (!newReply.trim()) return;

    setIsReplying(true);
    await createReply(newReply);
    setNewReply('');
    setIsReplying(false);
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-4 pt-4 border-t">
      {/* Replies List */}
      {loading ? (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Loading replies...
        </div>
      ) : replies.length > 0 ? (
        <div className="space-y-3">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-3 bg-muted/30 rounded-lg p-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={reply.profiles?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {reply.profiles?.display_name?.[0] || reply.profiles?.username?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {reply.profiles?.display_name || reply.profiles?.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {user?.id === reply.author_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReply(reply.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No replies yet. Be the first to reply!
        </p>
      )}

      {/* Reply Input */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Write a reply..."
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          className="min-h-[60px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleCreateReply();
            }
          }}
        />
        <Button
          onClick={handleCreateReply}
          disabled={!newReply.trim() || isReplying}
          size="sm"
          className="self-end"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CirclePostReplies;