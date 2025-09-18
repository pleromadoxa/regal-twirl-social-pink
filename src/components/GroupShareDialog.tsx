import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Share2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateNewInviteCode } from '@/services/groupConversationService';
import { useAuth } from '@/contexts/AuthContext';

interface GroupShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  currentInviteCode: string;
  isAdmin: boolean;
  onInviteCodeUpdated: (newCode: string) => void;
}

export const GroupShareDialog = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  currentInviteCode,
  isAdmin,
  onInviteCodeUpdated
}: GroupShareDialogProps) => {
  const [inviteCode, setInviteCode] = useState(currentInviteCode);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setInviteCode(currentInviteCode);
  }, [currentInviteCode]);

  const shareLink = `${window.location.origin}/join-group/${inviteCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast({
        title: "Link copied",
        description: "Invite link has been copied to clipboard"
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      toast({
        title: "Code copied",
        description: "Invite code has been copied to clipboard"
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${groupName}`,
          text: `You're invited to join ${groupName} on Regal Network!`,
          url: shareLink
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast({
            title: "Share failed",
            description: "Failed to share the invite link",
            variant: "destructive"
          });
        }
      }
    } else {
      // Fallback to copying
      handleCopyLink();
    }
  };

  const handleGenerateNewCode = async () => {
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "Only admins can generate new invite codes",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      const newCode = await generateNewInviteCode(groupId, user?.id || '');
      setInviteCode(newCode);
      onInviteCodeUpdated(newCode);
      
      toast({
        title: "New invite code generated",
        description: "A new invite code has been created"
      });
    } catch (error) {
      console.error('Error generating new code:', error);
      toast({
        title: "Failed to generate code",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Group</DialogTitle>
          <DialogDescription>
            Invite others to join {groupName} using the link or code below
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Invite Link */}
          <div className="space-y-2">
            <Label htmlFor="invite-link">Invite Link</Label>
            <div className="flex gap-2">
              <Input
                id="invite-link"
                value={shareLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Invite Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="invite-code">Invite Code</Label>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateNewCode}
                  disabled={isGenerating}
                  className="h-auto p-1 text-xs"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                  Generate New
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                id="invite-code"
                value={inviteCode}
                readOnly
                className="font-mono text-lg font-bold text-center"
              />
              <Button variant="outline" size="sm" onClick={handleCopyCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Users can enter this code to join the group
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">How to join:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Click the invite link</li>
              <li>• Or go to Messages → New Chat → Join Group and enter the code</li>
              <li>• Share this with people you want to invite</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};