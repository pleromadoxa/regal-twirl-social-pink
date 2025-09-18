import { useState } from 'react';
import { MoreVertical, UserPlus, UserMinus, Trash2, Edit, Settings, Users, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { dissolveGroup, leaveGroup } from '@/services/groupConversationService';
import { GroupProfileDialog } from './GroupProfileDialog';
import { GroupMembersDialog } from './GroupMembersDialog';
import { AddGroupMembersDialog } from './AddGroupMembersDialog';
import { GroupSettingsDialog } from './GroupSettingsDialog';
import { GroupShareDialog } from './GroupShareDialog';
import { useAuth } from '@/contexts/AuthContext';

interface GroupOptionsMenuProps {
  groupId: string;
  groupName: string;
  groupDescription?: string;
  groupSettings?: any;
  inviteCode?: string;
  isAdmin: boolean;
  members: Array<{ id: string; username: string; display_name: string; avatar_url: string; role: string; joined_at: string; }>;
  onGroupDissolved?: () => void;
  onGroupUpdated?: () => void;
}

export const GroupOptionsMenu = ({ 
  groupId, 
  groupName,
  groupDescription,
  groupSettings,
  inviteCode,
  isAdmin,
  members,
  onGroupDissolved,
  onGroupUpdated
}: GroupOptionsMenuProps) => {
  const [showDissolveDialog, setShowDissolveDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [showAddMembersDialog, setShowAddMembersDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [currentInviteCode, setCurrentInviteCode] = useState(inviteCode || '');
  const [isDissolving, setIsDissolving] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDissolveGroup = async () => {
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "Only group admins can dissolve groups.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsDissolving(true);
      await dissolveGroup(groupId, user?.id || '');
      
      toast({
        title: "Group dissolved",
        description: `${groupName} has been permanently deleted.`
      });
      
      onGroupDissolved?.();
      setShowDissolveDialog(false);
    } catch (error) {
      console.error('Error dissolving group:', error);
      toast({
        title: "Failed to dissolve group",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsDissolving(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      setIsLeaving(true);
      await leaveGroup(groupId, user?.id || '');
      
      toast({
        title: "Left group",
        description: `You have left ${groupName}`
      });
      
      onGroupDissolved?.(); // Reuse this callback to navigate away
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: "Failed to leave group",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowMembersDialog(true)}>
            <Users className="w-4 h-4 mr-2" />
            View Members
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Group
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuItem onClick={() => setShowAddMembersDialog(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Group Info
              </DropdownMenuItem>
            </>
          )}
          {isAdmin && (
            <>
              <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Group Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => setShowDissolveDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Dissolve Group
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={handleLeaveGroup}
            disabled={isLeaving}
          >
            <UserMinus className="w-4 h-4 mr-2" />
            {isLeaving ? "Leaving..." : "Leave Group"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDissolveDialog} onOpenChange={setShowDissolveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dissolve Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to dissolve "{groupName}"? This action cannot be undone. 
              All messages and group data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDissolving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDissolveGroup}
              disabled={isDissolving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDissolving ? "Dissolving..." : "Dissolve Group"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <GroupProfileDialog
        isOpen={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
        groupId={groupId}
        currentName={groupName}
        currentDescription={groupDescription}
        onGroupUpdated={() => {
          onGroupUpdated?.();
          setShowProfileDialog(false);
        }}
      />

      <GroupMembersDialog
        isOpen={showMembersDialog}
        onClose={() => setShowMembersDialog(false)}
        groupId={groupId}
        groupName={groupName}
        isCurrentUserAdmin={isAdmin}
      />

      <AddGroupMembersDialog
        isOpen={showAddMembersDialog}
        onClose={() => setShowAddMembersDialog(false)}
        groupId={groupId}
        groupName={groupName}
        existingMemberIds={members.map(m => m.id)}
        onMembersAdded={() => {
          onGroupUpdated?.();
          setShowAddMembersDialog(false);
        }}
      />

      <GroupSettingsDialog
        isOpen={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        groupId={groupId}
        groupName={groupName}
        currentSettings={groupSettings || {
          allow_member_invite: true,
          message_deletion: 'admin_only',
          file_sharing: true,
          max_members: 50
        }}
        onSettingsUpdated={() => {
          onGroupUpdated?.();
          setShowSettingsDialog(false);
        }}
      />

      <GroupShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        groupId={groupId}
        groupName={groupName}
        currentInviteCode={currentInviteCode}
        isAdmin={isAdmin}
        onInviteCodeUpdated={(newCode) => {
          setCurrentInviteCode(newCode);
          onGroupUpdated?.();
        }}
      />
    </>
  );
};