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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateGroupSettings } from '@/services/groupConversationService';
import { useAuth } from '@/contexts/AuthContext';

interface GroupSettings {
  allow_member_invite: boolean;
  message_deletion: 'admin_only' | 'anyone' | 'disabled';
  file_sharing: boolean;
  max_members: number;
}

interface GroupSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  currentSettings: GroupSettings;
  onSettingsUpdated: () => void;
}

export const GroupSettingsDialog = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  currentSettings,
  onSettingsUpdated
}: GroupSettingsDialogProps) => {
  const [settings, setSettings] = useState<GroupSettings>(currentSettings);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleUpdateSettings = async () => {
    try {
      setIsUpdating(true);
      await updateGroupSettings(groupId, settings);

      toast({
        title: "Settings updated",
        description: "Group settings have been updated successfully"
      });

      onSettingsUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating group settings:', error);
      toast({
        title: "Failed to update settings",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Group Settings</DialogTitle>
          <DialogDescription>
            Manage settings for {groupName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Member Permissions */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Member Permissions</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-invite">Allow members to invite others</Label>
                <p className="text-xs text-muted-foreground">
                  Let group members invite new people to the group
                </p>
              </div>
              <Switch
                id="allow-invite"
                checked={settings.allow_member_invite}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, allow_member_invite: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="file-sharing">File sharing</Label>
                <p className="text-xs text-muted-foreground">
                  Allow members to share files and media
                </p>
              </div>
              <Switch
                id="file-sharing"
                checked={settings.file_sharing}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, file_sharing: checked }))
                }
              />
            </div>
          </div>

          {/* Message Management */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Message Management</h4>
            
            <div className="space-y-2">
              <Label htmlFor="message-deletion">Who can delete messages</Label>
              <Select
                value={settings.message_deletion}
                onValueChange={(value: 'admin_only' | 'anyone' | 'disabled') =>
                  setSettings(prev => ({ ...prev, message_deletion: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select deletion policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin_only">Admins only</SelectItem>
                  <SelectItem value="anyone">Anyone</SelectItem>
                  <SelectItem value="disabled">No one</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Group Limits */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Group Limits</h4>
            
            <div className="space-y-2">
              <Label htmlFor="max-members">Maximum members</Label>
              <Input
                id="max-members"
                type="number"
                min="2"
                max="500"
                value={settings.max_members}
                onChange={(e) => 
                  setSettings(prev => ({ 
                    ...prev, 
                    max_members: Math.max(2, Math.min(500, parseInt(e.target.value) || 2))
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Set the maximum number of members (2-500)
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleUpdateSettings} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};