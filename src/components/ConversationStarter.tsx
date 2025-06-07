
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Users, User } from 'lucide-react';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import UserSearch from '@/components/UserSearch';
import GroupCreationDialog from '@/components/GroupCreationDialog';
import { createGroupConversation } from '@/services/groupConversationService';
import { useAuth } from '@/contexts/AuthContext';

const ConversationStarter = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { startDirectConversation } = useEnhancedMessages();

  const handleStartConversation = async (userId: string) => {
    await startDirectConversation(userId);
    setOpen(false);
  };

  const handleCreateGroup = async (groupName: string, participantIds: string[]) => {
    if (!user) return;
    
    try {
      await createGroupConversation(
        groupName,
        null,
        user.id,
        participantIds,
        false,
        50
      );
      setOpen(false);
      return groupName;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full flex-1">
            <MessageSquarePlus className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              Start New Conversation
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <UserSearch 
              onStartConversation={handleStartConversation}
              showMessageButton={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      <GroupCreationDialog
        onCreateGroup={handleCreateGroup}
        trigger={
          <Button variant="outline" size="sm" className="rounded-full">
            <Users className="w-4 h-4" />
          </Button>
        }
      />
    </div>
  );
};

export default ConversationStarter;
