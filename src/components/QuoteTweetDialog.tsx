import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import VerificationBadge from './VerificationBadge';

interface QuoteTweetPost {
  id: string;
  content: string;
  created_at: string;
  image_urls?: string[];
  profiles?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
    verification_level?: string;
  };
  business_pages?: {
    page_name?: string;
    page_avatar_url?: string;
  };
}

interface QuoteTweetDialogProps {
  post: QuoteTweetPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuoteTweet: (content: string, quotedPostId: string) => Promise<void>;
}

const QuoteTweetDialog = ({ post, open, onOpenChange, onQuoteTweet }: QuoteTweetDialogProps) => {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    try {
      await onQuoteTweet(content, post.id);
      setContent('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating quote tweet:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const displayProfile = post.business_pages || post.profiles;
  const displayName = post.business_pages?.page_name || post.profiles?.display_name || 'Unknown User';
  const username = post.profiles?.username || 'unknown';
  const avatarUrl = post.business_pages?.page_avatar_url || post.profiles?.avatar_url;
  const verificationLevel = post.profiles?.verification_level as 'verified' | 'vip' | 'business' | 'professional' | null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>ReQuote</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="Add a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={280}
          />

          <div className="text-sm text-muted-foreground text-right">
            {content.length}/280
          </div>

          {/* Quoted Post Preview */}
          <Card className="p-4 border-2">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{displayName[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm truncate">{displayName}</span>
                  <VerificationBadge level={verificationLevel} />
                  <span className="text-muted-foreground text-sm">@{username}</span>
                  <span className="text-muted-foreground text-sm">·</span>
                  <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>

                <p className="text-sm whitespace-pre-wrap break-words">{post.content}</p>

                {post.image_urls && post.image_urls.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {post.image_urls.slice(0, 4).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="Post attachment"
                        className="rounded-lg w-full h-32 object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPosting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isPosting}
            >
              {isPosting ? 'Posting...' : 'ReQuote'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteTweetDialog;
