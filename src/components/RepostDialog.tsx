import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Repeat2, Quote } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RepostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRepost: (content: string, type: 'repost' | 'quote') => Promise<void>;
  originalPost: {
    id: string;
    content: string;
    image_urls?: string[];
    created_at: string;
    profiles?: {
      username: string;
      display_name: string;
      avatar_url?: string;
    };
    business_pages?: {
      page_name: string;
      page_avatar_url?: string;
    };
  };
}

const RepostDialog = ({ isOpen, onClose, onRepost, originalPost }: RepostDialogProps) => {
  const [content, setContent] = useState('');
  const [repostType, setRepostType] = useState<'repost' | 'quote'>('repost');
  const [loading, setLoading] = useState(false);

  const isBusinessPagePost = !!originalPost.business_pages;
  const displayName = isBusinessPagePost 
    ? originalPost.business_pages?.page_name 
    : (originalPost.profiles?.display_name || originalPost.profiles?.username);
  const displayAvatar = isBusinessPagePost 
    ? originalPost.business_pages?.page_avatar_url 
    : originalPost.profiles?.avatar_url;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onRepost(content, repostType);
      setContent('');
      onClose();
    } catch (error) {
      console.error('Error reposting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat2 className="w-5 h-5 text-green-600" />
            Repost
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Repost Type Selection */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Button
              variant={repostType === 'repost' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setRepostType('repost')}
            >
              <Repeat2 className="w-4 h-4 mr-2" />
              Repost
            </Button>
            <Button
              variant={repostType === 'quote' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setRepostType('quote')}
            >
              <Quote className="w-4 h-4 mr-2" />
              Quote
            </Button>
          </div>

          {/* Caption Input (for quote reposts) */}
          {repostType === 'quote' && (
            <div>
              <Textarea
                placeholder="Add your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {content.length} / 280 characters
              </p>
            </div>
          )}

          {/* Original Post Preview */}
          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={displayAvatar} />
                <AvatarFallback>
                  {displayName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm truncate">
                    {displayName}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    @{originalPost.profiles?.username || 'unknown'}
                  </span>
                  <span className="text-muted-foreground text-sm">·</span>
                  <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(originalPost.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-sm whitespace-pre-wrap break-words mb-2">
                  {originalPost.content}
                </p>
                
                {originalPost.image_urls && originalPost.image_urls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {originalPost.image_urls.slice(0, 4).map((url, i) => (
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
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || (repostType === 'quote' && content.length > 280)}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Posting...' : repostType === 'repost' ? 'Repost' : 'Quote'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RepostDialog;
