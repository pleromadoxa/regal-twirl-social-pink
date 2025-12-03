import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share, Copy, Twitter, Facebook, Linkedin, Mail, MessageCircle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SharePostDialogProps {
  postId: string;
  postContent?: string;
  trigger?: React.ReactNode;
}

const SharePostDialog = ({ postId, postContent, trigger }: SharePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const postUrl = `${window.location.origin}/post/${postId}`;
  const shareText = postContent ? postContent.substring(0, 100) + (postContent.length > 100 ? '...' : '') : 'Check out this post on Regal Network!';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Post link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive"
      });
    }
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + postUrl)}`;
    window.open(url, '_blank');
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent('Check out this post on Regal Network');
    const body = encodeURIComponent(`${shareText}\n\n${postUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Regal Network Post',
          text: shareText,
          url: postUrl,
        });
        toast({
          title: "Shared successfully!",
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors rounded-full p-2">
            <Share className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Share Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Copy Link */}
          <div className="flex items-center space-x-2">
            <Input
              value={postUrl}
              readOnly
              className="flex-1 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300"
              onClick={shareToTwitter}
            >
              <Twitter className="w-5 h-5 text-blue-400" />
              <span className="text-xs">Twitter</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500"
              onClick={shareToFacebook}
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="text-xs">Facebook</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-600"
              onClick={shareToLinkedIn}
            >
              <Linkedin className="w-5 h-5 text-blue-700" />
              <span className="text-xs">LinkedIn</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-400"
              onClick={shareToWhatsApp}
            >
              <MessageCircle className="w-5 h-5 text-green-500" />
              <span className="text-xs">WhatsApp</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400"
              onClick={shareByEmail}
            >
              <Mail className="w-5 h-5 text-gray-600" />
              <span className="text-xs">Email</span>
            </Button>

            {navigator.share && (
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-400"
                onClick={nativeShare}
              >
                <Share className="w-5 h-5 text-purple-600" />
                <span className="text-xs">More</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePostDialog;
