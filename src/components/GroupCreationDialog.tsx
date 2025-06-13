
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserPlus, Camera, X, Search, Sparkles } from "lucide-react";

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
}

interface GroupCreationDialogProps {
  onGroupCreated?: () => void;
}

const GroupCreationDialog = ({ onGroupCreated }: GroupCreationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .neq('id', user?.id)
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const toggleUserSelection = (selectedUser: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === selectedUser.id);
      if (isSelected) {
        return prev.filter(u => u.id !== selectedUser.id);
      }
      return [...prev, selectedUser];
    });
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group",
        variant: "destructive"
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast({
        title: "Add members",
        description: "Please add at least one member to your group",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create the group conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          name: groupName,
          description: description || null,
          is_group: true,
          is_private: isPrivate,
          created_by: user?.id
        })
        .select()
        .single();

      if (conversationError) throw conversationError;

      // Add the creator as a participant
      const participants = [
        {
          conversation_id: conversation.id,
          user_id: user?.id,
          role: 'admin',
          joined_at: new Date().toISOString()
        },
        // Add selected users as members
        ...selectedUsers.map(selectedUser => ({
          conversation_id: conversation.id,
          user_id: selectedUser.id,
          role: 'member',
          joined_at: new Date().toISOString()
        }))
      ];

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      // Send welcome message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user?.id,
          content: `Welcome to ${groupName}! 🎉`,
          type: 'system'
        });

      if (messageError) console.error('Error sending welcome message:', messageError);

      toast({
        title: "Group created successfully! ✨",
        description: `${groupName} has been created with ${selectedUsers.length} members`,
      });

      // Reset form
      setGroupName("");
      setDescription("");
      setIsPrivate(false);
      setSelectedUsers([]);
      setSearchQuery("");
      setSearchResults([]);
      setOpen(false);

      onGroupCreated?.();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error creating group",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white backdrop-blur-xl border-0 shadow-lg">
          <UserPlus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-purple-200 dark:border-purple-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Create New Group
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Group Details */}
            <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div>
                <Label htmlFor="groupName" className="text-sm font-medium">Group Name *</Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="mt-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-purple-200 dark:border-purple-700"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this group about?"
                  rows={3}
                  className="mt-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-purple-200 dark:border-purple-700"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isPrivate" 
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
                <Label htmlFor="isPrivate" className="text-sm">Make this group private</Label>
              </div>
            </div>

            {/* Member Search */}
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Search className="w-4 h-4" />
                Add Members *
              </Label>
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                placeholder="Search users by username or name..."
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-purple-200 dark:border-purple-700"
              />
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-purple-200 dark:border-purple-700">
                  {searchResults.map((searchUser) => (
                    <div
                      key={searchUser.id}
                      className="flex items-center justify-between p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg cursor-pointer transition-colors"
                      onClick={() => toggleUserSelection(searchUser)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={searchUser.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                            {searchUser.display_name?.charAt(0) || searchUser.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{searchUser.display_name}</p>
                          <p className="text-xs text-muted-foreground">@{searchUser.username}</p>
                        </div>
                      </div>
                      <Checkbox 
                        checked={selectedUsers.some(u => u.id === searchUser.id)}
                        onChange={() => toggleUserSelection(searchUser)}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {searchLoading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              )}
            </div>

            {/* Selected Members */}
            {selectedUsers.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Selected Members ({selectedUsers.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((selectedUser) => (
                    <Badge 
                      key={selectedUser.id} 
                      variant="secondary" 
                      className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200 px-3 py-1 flex items-center gap-2"
                    >
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={selectedUser.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                          {selectedUser.display_name?.charAt(0) || selectedUser.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {selectedUser.display_name}
                      <button
                        onClick={() => toggleUserSelection(selectedUser)}
                        className="ml-1 hover:bg-red-200 dark:hover:bg-red-800 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end space-x-3 pt-4 border-t border-purple-200 dark:border-purple-800">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            Cancel
          </Button>
          <Button 
            onClick={createGroup}
            disabled={loading || !groupName.trim() || selectedUsers.length === 0}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Group
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupCreationDialog;
