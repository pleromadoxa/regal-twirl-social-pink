
import { useState } from 'react';
import { useReplies } from '@/hooks/useReplies';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2, CheckCircle } from 'lucide-react';

interface RepliesSectionProps {
  postId: string;
}

export const RepliesSection = ({ postId }: RepliesSectionProps) => {
  const { replies, loading, createReply, deleteReply } = useReplies(postId);
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createReply(replyContent);
      setReplyContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;
    await deleteReply(replyId);
  };

  const getVerifiedStatus = (replyUser: any) => {
    if (!replyUser) return false;
    
    if (replyUser.username === 'pleromadoxa') {
      return true;
    }
    
    // Add other verification logic as needed
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Reply composer */}
      {user && (
        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user.user_metadata?.display_name?.[0] || user.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[80px] resize-none border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSubmitReply();
                }
              }}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Ctrl/Cmd + Enter to submit
              </span>
              <Button
                onClick={handleSubmitReply}
                disabled={!replyContent.trim() || isSubmitting}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Send className="w-4 h-4 mr-1" />
                {isSubmitting ? 'Posting...' : 'Reply'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Replies list */}
      <div className="space-y-3">
        {replies.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            No replies yet. Be the first to reply!
          </p>
        ) : (
          replies.map((reply) => {
            const isVerified = getVerifiedStatus(reply.profiles);
            const isOwnReply = user?.id === reply.user_id;
            
            return (
              <Card key={reply.id} className="border-slate-200 dark:border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={reply.profiles.avatar_url} />
                      <AvatarFallback>
                        {reply.profiles.display_name?.[0] || reply.profiles.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                            {reply.profiles.display_name || reply.profiles.username}
                          </h4>
                          {isVerified && (
                            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 px-1 py-0.5">
                              <CheckCircle className="w-3 h-3" />
                            </Badge>
                          )}
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 text-xs">
                          @{reply.profiles.username}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 text-xs">
                          {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                        </span>
                        {isOwnReply && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReply(reply.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RepliesSection;
