import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserMinus, Crown, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchGroupMembers } from '@/services/groupConversationService';
import { useAuth } from '@/contexts/AuthContext';

interface GroupMember {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  role: string;
  joined_at: string;
}

interface GroupMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  isCurrentUserAdmin: boolean;
}

export const GroupMembersDialog = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  isCurrentUserAdmin
}: GroupMembersDialogProps) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen, groupId]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const membersData = await fetchGroupMembers(groupId);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading group members:', error);
      toast({
        title: "Failed to load members",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">Admin</Badge>;
      case 'moderator':
        return <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">Moderator</Badge>;
      default:
        return <Badge variant="outline">Member</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle>Group Members</DialogTitle>
          <DialogDescription>
            Members of {groupName} ({members.length} total)
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              No members found
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      {member.display_name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {member.display_name}
                      </span>
                      {getRoleIcon(member.role)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      @{member.username}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getRoleBadge(member.role)}
                  {isCurrentUserAdmin && member.id !== user?.id && member.role !== 'admin' && (
                    <Button variant="ghost" size="sm" className="p-2 text-red-500 hover:text-red-600">
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};