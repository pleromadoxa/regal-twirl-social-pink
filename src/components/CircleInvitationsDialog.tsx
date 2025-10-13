import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useCircleInvitations } from '@/hooks/useCircleInvitations';

interface CircleInvitationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CircleInvitationsDialog = ({ open, onOpenChange }: CircleInvitationsDialogProps) => {
  const { invitations, loading, respondToInvitation } = useCircleInvitations();

  const handleRespond = async (invitationId: string, status: 'accepted' | 'declined') => {
    await respondToInvitation(invitationId, status);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Circle Invitations</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading invitations...
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending invitations
            </div>
          ) : (
            invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Avatar>
                    <AvatarImage src={invitation.inviter_profile?.avatar_url} />
                    <AvatarFallback>
                      {invitation.inviter_profile?.display_name?.[0] ||
                        invitation.inviter_profile?.username?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {invitation.inviter_profile?.display_name ||
                        invitation.inviter_profile?.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      invited you to{' '}
                      <Badge
                        variant="secondary"
                        style={{ backgroundColor: invitation.user_circles?.color }}
                        className="text-white"
                      >
                        {invitation.user_circles?.name}
                      </Badge>
                    </p>
                    {invitation.message && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        "{invitation.message}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleRespond(invitation.id, 'accepted')}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleRespond(invitation.id, 'declined')}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CircleInvitationsDialog;
