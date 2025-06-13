
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus } from 'lucide-react';

interface GroupCreationDialogProps {
  trigger?: React.ReactNode;
  onGroupCreated?: (groupId: string) => void;
}

export const GroupCreationDialog = ({ trigger, onGroupCreated }: GroupCreationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .neq('id', user?.id)
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const createGroup = async () => {
    if (!user || !groupName.trim()) return;

    try {
      setLoading(true);

      // Create group conversation
      const { data: groupData, error: groupError } = await supabase
        .from('group_conversations')
        .insert({
          name: groupName,
          description: groupDescription,
          created_by: user.id,
          is_private: false
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin
      const { error: memberError1 } = await supabase
        .from('group_conversation_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError1) throw memberError1;

      // Add selected users as members
      if (selectedUsers.length > 0) {
        const memberInserts = selectedUsers.map(userId => ({
          group_id: groupData.id,
          user_id: userId,
          role: 'member'
        }));

        const { error: memberError2 } = await supabase
          .from('group_conversation_members')
          .insert(memberInserts);

        if (memberError2) throw memberError2;
      }

      toast({
        title: "Group created!",
        description: `${groupName} has been created successfully.`
      });

      setOpen(false);
      setGroupName('');
      setGroupDescription('');
      setSelectedUsers([]);
      
      if (onGroupCreated) {
        onGroupCreated(groupData.id);
      }

    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      fetchUsers();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Group
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create New Group
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>

          <div>
            <Label htmlFor="groupDescription">Description (Optional)</Label>
            <Input
              id="groupDescription"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Enter group description"
            />
          </div>

          <div>
            <Label>Add Members</Label>
            <ScrollArea className="h-48 border rounded-md p-2">
              {users.map((profile) => (
                <div key={profile.id} className="flex items-center space-x-3 py-2">
                  <Checkbox
                    checked={selectedUsers.includes(profile.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleUserToggle(profile.id);
                      } else {
                        handleUserToggle(profile.id);
                      }
                    }}
                  />
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback>
                      {(profile.display_name || profile.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {profile.display_name || profile.username}
                    </p>
                    {profile.display_name && profile.username && (
                      <p className="text-xs text-muted-foreground">@{profile.username}</p>
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createGroup} 
              disabled={!groupName.trim() || loading}
            >
              {loading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupCreationDialog;
