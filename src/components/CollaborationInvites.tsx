import React from 'react';
import { Check, X, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCollaboration, CollaborationInvite } from '@/hooks/useCollaboration';
import { formatDistanceToNow } from 'date-fns';

interface CollaborationInvitesProps {
  invites: CollaborationInvite[];
  onInviteUpdate?: () => void;
}

const CollaborationInvites = ({ invites, onInviteUpdate }: CollaborationInvitesProps) => {
  const { respondToInvite, loading } = useCollaboration();

  const handleResponse = async (inviteId: string, status: 'accepted' | 'declined') => {
    const success = await respondToInvite(inviteId, status);
    if (success && onInviteUpdate) {
      onInviteUpdate();
    }
  };

  if (invites.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No collaboration invites</h3>
        <p className="text-muted-foreground">
          When someone invites you to collaborate on a post, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invites.map((invite) => (
        <Card key={invite.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={invite.inviter_profile.avatar_url} />
                  <AvatarFallback>
                    {invite.inviter_profile.display_name?.[0]?.toUpperCase() || 
                     invite.inviter_profile.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {invite.inviter_profile.display_name || invite.inviter_profile.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{invite.inviter_profile.username}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {invite.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-foreground mb-2">
                <strong>{invite.inviter_profile.display_name || invite.inviter_profile.username}</strong> 
                {' '}invited you to collaborate on a post
              </p>
              
              {invite.message && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground italic">
                    "{invite.message}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Invited {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
              </span>
              <span>
                Expires {formatDistanceToNow(new Date(invite.expires_at), { addSuffix: true })}
              </span>
            </div>

            {invite.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleResponse(invite.id, 'accepted')}
                  disabled={loading}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResponse(invite.id, 'declined')}
                  disabled={loading}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Decline
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CollaborationInvites;