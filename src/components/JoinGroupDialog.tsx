import { useState } from 'react';
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
import { Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { joinGroupByInviteCode } from '@/services/groupConversationService';
import { useAuth } from '@/contexts/AuthContext';

interface JoinGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupJoined: (groupId: string) => void;
}

export const JoinGroupDialog = ({
  isOpen,
  onClose,
  onGroupJoined
}: JoinGroupDialogProps) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Invalid code",
        description: "Please enter an invite code",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsJoining(true);
      const group = await joinGroupByInviteCode(inviteCode.trim().toUpperCase(), user?.id || '');
      
      if (group) {
        toast({
          title: "Joined group",
          description: `Welcome to ${group.name}!`
        });
        
        onGroupJoined(group.id);
        onClose();
        setInviteCode('');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Failed to join group",
        description: error instanceof Error ? error.message : "Please check the invite code and try again",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleClose = () => {
    setInviteCode('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Join Group
          </DialogTitle>
          <DialogDescription>
            Enter the invite code to join a group conversation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Invite Code</Label>
            <Input
              id="invite-code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter invite code"
              className="font-mono text-lg font-bold text-center"
              maxLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Enter the 8-character code shared by group members
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isJoining}>
            Cancel
          </Button>
          <Button onClick={handleJoinGroup} disabled={isJoining || !inviteCode.trim()}>
            {isJoining ? "Joining..." : "Join Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};