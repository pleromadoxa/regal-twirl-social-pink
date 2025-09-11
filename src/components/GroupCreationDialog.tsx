import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Search, Link2, Share, Copy, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

interface GroupCreationDialogProps {
  onGroupCreated?: (groupId: string) => void;
}

const GroupCreationDialog = ({ onGroupCreated }: GroupCreationDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'create' | 'invite' | 'share'>('create');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const searchUsers = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
        .neq('id', user?.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const toggleUserSelection = (selectedUser: User) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u.id === selectedUser.id);
      if (exists) {
        return prev.filter(u => u.id !== selectedUser.id);
      } else {
        return [...prev, selectedUser];
      }
    });
  };

  const createGroup = async () => {
    if (!groupName.trim() || !user) return;

    setLoading(true);
    try {
      // Create group conversation
      const { data: group, error: groupError } = await supabase
        .from('group_conversations')
        .insert({
          name: groupName.trim(),
          description: groupDescription.trim() || null,
          created_by: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('group_conversation_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      // Add selected users as members
      if (selectedUsers.length > 0) {
        const memberInserts = selectedUsers.map(selectedUser => ({
          group_id: group.id,
          user_id: selectedUser.id,
          role: 'member'
        }));

        const { error: membersError } = await supabase
          .from('group_conversation_members')
          .insert(memberInserts);

        if (membersError) throw membersError;
      }

      // Generate invite code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_invite_code');

      if (codeError) throw codeError;

      setInviteCode(codeData);
      setCreatedGroupId(group.id);
      setStep('share');
      
      toast({
        title: "Group created successfully!",
        description: `${groupName} is ready for conversations`
      });

      onGroupCreated?.(group.id);
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error creating group",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link copied!",
      description: "Invite link has been copied to clipboard"
    });
  };

  const resetDialog = () => {
    setStep('create');
    setGroupName('');
    setGroupDescription('');
    setSelectedUsers([]);
    setSearchTerm('');
    setSearchResults([]);
    setInviteCode('');
    setCreatedGroupId(null);
    setCopied(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetDialog, 300); // Reset after dialog animation
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-300/50 hover:from-purple-500/20 hover:to-pink-500/20"
        >
          <Users className="w-4 h-4" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            {step === 'create' && 'Create Group Chat'}
            {step === 'invite' && 'Add Members'}
            {step === 'share' && 'Share Group'}
          </DialogTitle>
        </DialogHeader>

        {step === 'create' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="border-purple-200/50 focus:border-purple-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="groupDescription">Description (optional)</Label>
              <Input
                id="groupDescription"
                placeholder="What's this group about?"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="border-purple-200/50 focus:border-purple-400"
              />
            </div>

            <div className="space-y-2">
              <Label>Add Members</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-purple-200/50 focus:border-purple-400"
                />
              </div>
              
              {searchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-purple-200/50 rounded-lg p-2 space-y-1">
                  {searchResults.map((searchUser) => (
                    <div
                      key={searchUser.id}
                      className="flex items-center gap-3 p-2 hover:bg-purple-50/50 rounded-lg cursor-pointer"
                      onClick={() => toggleUserSelection(searchUser)}
                    >
                      <Checkbox
                        checked={selectedUsers.some(u => u.id === searchUser.id)}
                      />
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={searchUser.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                          {(searchUser.display_name?.[0] || searchUser.username?.[0] || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {searchUser.display_name || searchUser.username || 'Unknown User'}
                        </p>
                        {searchUser.username && (
                          <p className="text-xs text-gray-500">@{searchUser.username}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-purple-50/50 rounded-lg">
                  {selectedUsers.map((selectedUser) => (
                    <Badge
                      key={selectedUser.id}
                      variant="secondary"
                      className="flex items-center gap-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700"
                    >
                      {selectedUser.display_name || selectedUser.username}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => toggleUserSelection(selectedUser)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createGroup}
                disabled={!groupName.trim() || loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </div>
        )}

        {step === 'share' && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{groupName}</h3>
              <p className="text-sm text-gray-600">Group created successfully!</p>
            </div>

            <div className="space-y-3">
              <Label>Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/join/${inviteCode}`}
                  readOnly
                  className="flex-1 bg-gray-50 border-purple-200/50"
                />
                <Button
                  onClick={copyInviteLink}
                  variant="outline"
                  size="icon"
                  className="border-purple-200/50"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Share this link with friends to invite them to the group
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Done
              </Button>
              <Button
                onClick={copyInviteLink}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2"
              >
                <Share className="w-4 h-4" />
                Share Link
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GroupCreationDialog;