
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, X, Search, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

interface GroupCreationDialogProps {
  onCreateGroup: (groupName: string, participantIds: string[]) => Promise<string | undefined>;
  trigger?: React.ReactNode;
}

const GroupCreationDialog = ({ onCreateGroup, trigger }: GroupCreationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [participants, setParticipants] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
          .neq('id', user?.id || '')
          .limit(10);

        if (error) throw error;

        // Filter out already selected participants
        const filteredResults = (data || []).filter(
          searchUser => !participants.some(p => p.id === searchUser.id)
        );

        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching users:', error);
        toast({
          title: "Search failed",
          description: "Could not search for users",
          variant: "destructive"
        });
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, participants, user]);

  const handleAddParticipant = (selectedUser: User) => {
    if (!participants.some(p => p.id === selectedUser.id)) {
      setParticipants([...participants, selectedUser]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleRemoveParticipant = (userId: string) => {
    setParticipants(participants.filter(p => p.id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group",
        variant: "destructive"
      });
      return;
    }

    if (participants.length === 0) {
      toast({
        title: "Participants required",
        description: "Please add at least one participant",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating group with participants:', participants.map(p => p.id));
      const participantIds = participants.map(p => p.id);
      const conversationId = await onCreateGroup(groupName.trim(), participantIds);
      
      if (conversationId) {
        console.log('Group created successfully:', conversationId);
        toast({
          title: "Group created!",
          description: `Successfully created "${groupName}" with ${participants.length} members`,
        });
        
        // Reset form and close dialog
        setOpen(false);
        setGroupName('');
        setParticipants([]);
        setSearchQuery('');
        setSearchResults([]);
      } else {
        throw new Error('Failed to create group - no conversation ID returned');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Failed to create group",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="rounded-full">
            <Users className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Create New Group
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4 flex-1 overflow-hidden">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName" className="text-sm font-medium">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="rounded-2xl"
            />
          </div>

          {/* User Search */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Add Participants</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by username or name..."
                className="pl-10 rounded-2xl"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1 border border-purple-200 dark:border-purple-700 rounded-xl p-2 bg-slate-50 dark:bg-slate-800">
                {searchResults.map((searchUser) => (
                  <div
                    key={searchUser.id}
                    className="flex items-center justify-between p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleAddParticipant(searchUser)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={searchUser.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                          {(searchUser.display_name || searchUser.username || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{searchUser.display_name || searchUser.username}</p>
                        <p className="text-xs text-slate-500">@{searchUser.username}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Participants */}
          {participants.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Selected Participants</Label>
                <Badge variant="secondary" className="text-xs">
                  {participants.length} selected
                </Badge>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-2 border border-purple-200 dark:border-purple-700 rounded-xl p-3 bg-purple-50/50 dark:bg-purple-900/20">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                          {(participant.display_name || participant.username || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{participant.display_name || participant.username}</p>
                        <p className="text-xs text-slate-500">@{participant.username}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemoveParticipant(participant.id)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create Button */}
          <Button 
            onClick={handleCreateGroup}
            disabled={loading || !groupName.trim() || participants.length === 0}
            className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Creating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Create Group ({participants.length} members)
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupCreationDialog;
