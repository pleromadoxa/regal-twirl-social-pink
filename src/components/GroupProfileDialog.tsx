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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateGroupProfile } from '@/services/groupConversationService';
import { useAuth } from '@/contexts/AuthContext';

interface GroupProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  currentName: string;
  currentDescription?: string;
  onGroupUpdated: () => void;
}

export const GroupProfileDialog = ({
  isOpen,
  onClose,
  groupId,
  currentName,
  currentDescription,
  onGroupUpdated
}: GroupProfileDialogProps) => {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdating(true);
      await updateGroupProfile(groupId, user?.id || '', {
        name: name.trim(),
        description: description.trim() || null
      });

      toast({
        title: "Group updated",
        description: "Group profile has been updated successfully"
      });

      onGroupUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating group profile:', error);
      toast({
        title: "Failed to update group",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Group Info</DialogTitle>
          <DialogDescription>
            Update the group name and description.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              maxLength={50}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description (optional)"
              maxLength={200}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleUpdateProfile} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};