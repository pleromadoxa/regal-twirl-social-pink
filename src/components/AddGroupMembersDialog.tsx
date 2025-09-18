import { useState, useEffect } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addGroupMembers } from '@/services/groupConversationService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

interface AddGroupMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  existingMemberIds: string[];
  onMembersAdded: () => void;
}

export const AddGroupMembersDialog = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  existingMemberIds,
  onMembersAdded
}: AddGroupMembersDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  const searchUsers = async () => {
    try {
      setIsSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .not('id', 'in', `(${existingMemberIds.join(',')})`)
        .limit(20);

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Search failed",
        description: "Failed to search for users",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedUserIds.length === 0) {
      toast({
        title: "No members selected",
        description: "Please select at least one user to add",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAdding(true);
      await addGroupMembers(groupId, user?.id || '', selectedUserIds);
      
      toast({
        title: "Members added",
        description: `Successfully added ${selectedUserIds.length} member(s) to ${groupName}`
      });

      onMembersAdded();
      onClose();
      setSelectedUserIds([]);
      setSearchTerm('');
      setUsers([]);
    } catch (error) {
      console.error('Error adding members:', error);
      toast({
        title: "Failed to add members",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
          <DialogDescription>
            Search and add new members to {groupName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by username or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Searching...
              </div>
            ) : users.length === 0 && searchTerm.length >= 2 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : searchTerm.length < 2 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Type at least 2 characters to search
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {(user.display_name || user.username || 'U')[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {user.display_name || user.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        @{user.username}
                      </span>
                    </div>
                  </div>
                  
                  <Checkbox
                    checked={selectedUserIds.includes(user.id)}
                    onCheckedChange={() => handleUserToggle(user.id)}
                  />
                </div>
              ))
            )}
          </div>

          {selectedUserIds.length > 0 && (
            <div className="p-3 bg-accent/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {selectedUserIds.length} user(s) selected
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isAdding}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddMembers} 
            disabled={isAdding || selectedUserIds.length === 0}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {isAdding ? "Adding..." : `Add ${selectedUserIds.length} Member(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};