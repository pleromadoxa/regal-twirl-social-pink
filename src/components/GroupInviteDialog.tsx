
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { joinGroupByInviteCode } from '@/services/groupConversationService';

interface GroupInviteDialogProps {
  onGroupJoined: () => void;
  trigger?: React.ReactNode;
}

const GroupInviteDialog = ({ onGroupJoined, trigger }: GroupInviteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleJoinGroup = async () => {
    if (!inviteCode.trim() || !user) {
      toast({
        title: "Invalid invite code",
        description: "Please enter a valid invite code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await joinGroupByInviteCode(inviteCode.trim(), user.id);
      toast({
        title: "Joined group",
        description: "You have successfully joined the group",
      });
      setOpen(false);
      setInviteCode('');
      onGroupJoined();
    } catch (error: any) {
      toast({
        title: "Failed to join group",
        description: error.message || "Invalid invite code or you're already a member",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="rounded-full">
            <UserPlus className="w-4 h-4 mr-2" />
            Join Group
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-600" />
            Join Group with Invite Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="inviteCode" className="text-sm font-medium">
              Invite Code
            </Label>
            <Input
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 8-character invite code"
              className="rounded-2xl text-center font-mono text-lg tracking-wider"
              maxLength={8}
            />
            <p className="text-xs text-slate-500 text-center">
              Ask a group member for the invite code
            </p>
          </div>

          <Button 
            onClick={handleJoinGroup}
            disabled={loading || !inviteCode.trim()}
            className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Joining...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Join Group
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupInviteDialog;
