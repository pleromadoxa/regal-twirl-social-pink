
import { useState } from 'react';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useReplies } from '@/hooks/useReplies';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface RepliesSectionProps {
  postId: string;
  initialRepliesCount?: number;
}

const RepliesSection = ({ postId, initialRepliesCount = 0 }: RepliesSectionProps) => {
  const { user } = useAuth();
  const { replies, loading, createReply, deleteReply } = useReplies(postId);
  const [showReplies, setShowReplies] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    setIsSubmitting(true);
    await createReply(newReply);
    setNewReply('');
    setIsSubmitting(false);
  };

  const repliesCount = replies.length || initialRepliesCount;

  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowReplies(!showReplies)}
        className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-full"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm">{repliesCount}</span>
        <span className="text-sm">{showReplies ? 'Hide' : 'Show'} replies</span>
      </Button>

      {showReplies && (
        <div className="space-y-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
          {/* Reply Form */}
          {user && (
            <form onSubmit={handleSubmitReply} className="space-y-3">
              <Textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[80px] resize-none"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newReply.trim() || isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Reply
              </Button>
            </form>
          )}

          {/* Replies List */}
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : replies.length > 0 ? (
            <div className="space-y-3">
              {replies.map((reply) => (
                <Card key={reply.id} className="border-slate-200 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                        {reply.profiles?.avatar_url ? (
                          <img
                            src={reply.profiles.avatar_url}
                            alt={reply.profiles.display_name || reply.profiles.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                            {(reply.profiles?.display_name || reply.profiles?.username || 'U')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
                              {reply.profiles?.display_name || reply.profiles?.username || 'Unknown User'}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400 text-xs">
                              {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          {user && reply.user_id === user.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteReply(reply.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">
              No replies yet. Be the first to reply!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RepliesSection;
