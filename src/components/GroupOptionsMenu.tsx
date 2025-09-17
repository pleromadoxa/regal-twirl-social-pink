import { useState } from 'react';
import { MoreVertical, UserPlus, UserMinus, Trash2, Edit, Settings } from 'lucide-react';
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
import { dissolveGroup } from '@/services/groupConversationService';

import { useAuth } from '@/contexts/AuthContext';

interface GroupOptionsMenuProps {
  groupId: string;
  groupName: string;
  isAdmin: boolean;
  onGroupDissolved?: () => void;
}

export const GroupOptionsMenu = ({ 
  groupId, 
  groupName, 
  isAdmin, 
  onGroupDissolved 
}: GroupOptionsMenuProps) => {
  const [showDissolveDialog, setShowDissolveDialog] = useState(false);
  const [isDissolving, setIsDissolving] = useState(false);
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Members
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit className="w-4 h-4 mr-2" />
            Edit Group Info
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuItem>
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
          <DropdownMenuItem>
            <UserMinus className="w-4 h-4 mr-2" />
            Leave Group
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
    </>
  );
};