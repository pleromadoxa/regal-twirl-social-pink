import React, { useState } from 'react';
import { Users, UserPlus, X, Check, Clock, Crown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCollaboration, Collaborator } from '@/hooks/useCollaboration';
import { useAuth } from '@/contexts/AuthContext';
import CollaboratorSearch from './CollaboratorSearch';

interface CollaborationManagerProps {
  postId?: string;
  collaborators?: Collaborator[];
  trigger?: React.ReactNode;
  onCollaboratorsUpdate?: () => void;
}

const CollaborationManager = ({ 
  postId, 
  collaborators = [], 
  trigger,
  onCollaboratorsUpdate 
}: CollaborationManagerProps) => {
  const [open, setOpen] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  
  const { user } = useAuth();
  const { inviteCollaborator, loading } = useCollaboration();

  const handleInviteUser = async () => {
    if (!selectedUser || !postId) return;

    const success = await inviteCollaborator(postId, selectedUser.id, inviteMessage);
    if (success) {
      setSelectedUser(null);
      setInviteMessage('');
      setShowUserSearch(false);
      if (onCollaboratorsUpdate) onCollaboratorsUpdate();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'creator':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'collaborator':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'contributor':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      accepted: 'default',
      pending: 'secondary',
      declined: 'destructive'
    };

    const icons = {
      accepted: <Check className="w-3 h-3 mr-1" />,
      pending: <Clock className="w-3 h-3 mr-1" />,
      declined: <X className="w-3 h-3 mr-1" />
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any} className="text-xs">
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            Collaborate ({collaborators.length})
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Collaboration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Collaborators */}
          <div>
            <h3 className="font-medium text-sm mb-3">Current Collaborators</h3>
            {collaborators.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No collaborators yet
              </p>
            ) : (
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={collaborator.profiles.avatar_url} />
                          <AvatarFallback>
                            {collaborator.profiles.display_name?.[0]?.toUpperCase() || 
                             collaborator.profiles.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {collaborator.profiles.display_name || collaborator.profiles.username}
                          </p>
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(collaborator.role)}
                            <span className="text-xs text-muted-foreground capitalize">
                              {collaborator.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(collaborator.status)}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <Separator />

          {/* Invite New Collaborator */}
          {postId && (
            <div>
              <h3 className="font-medium text-sm mb-3">Invite Collaborator</h3>
              
              {!showUserSearch ? (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowUserSearch(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Search Users
                </Button>
              ) : (
                <div className="space-y-3">
                  <CollaboratorSearch
                    onUserSelect={setSelectedUser}
                    placeholder="Search for users to invite..."
                    excludeUserIds={[
                      user?.id || '',
                      ...collaborators.map(c => c.user_id)
                    ]}
                  />
                  
                  {selectedUser && (
                    <div className="p-3 rounded-lg border bg-muted/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={selectedUser.avatar_url} />
                          <AvatarFallback>
                            {selectedUser.display_name?.[0]?.toUpperCase() || 
                             selectedUser.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {selectedUser.display_name || selectedUser.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{selectedUser.username}
                          </p>
                        </div>
                      </div>
                      
                      <Textarea
                        placeholder="Add a message to your invitation (optional)..."
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        rows={2}
                        className="mb-3"
                      />
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleInviteUser}
                          disabled={loading}
                          className="flex-1"
                        >
                          {loading ? 'Sending...' : 'Send Invite'}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(null);
                            setInviteMessage('');
                            setShowUserSearch(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationManager;