
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Users, User } from 'lucide-react';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import UserSearch from '@/components/UserSearch';
import GroupCreationDialog from '@/components/GroupCreationDialog';

const ConversationStarter = () => {
  const [open, setOpen] = useState(false);
  const { startDirectConversation, createGroupConversation } = useEnhancedMessages();

  const handleStartConversation = async (userId: string) => {
    await startDirectConversation(userId);
    setOpen(false);
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
        onCreateGroup={createGroupConversation}
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
