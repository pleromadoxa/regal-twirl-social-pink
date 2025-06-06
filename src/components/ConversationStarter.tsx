
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, Users, Search } from 'lucide-react';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useToast } from '@/hooks/use-toast';
import GroupCreationDialog from './GroupCreationDialog';

const ConversationStarter = () => {
  const [open, setOpen] = useState(false);
  const [searchUserId, setSearchUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { startDirectConversation, createGroupConversation } = useEnhancedMessages();
  const { toast } = useToast();

  const handleStartDirectConversation = async () => {
    if (!searchUserId.trim()) {
      toast({
        title: "User ID required",
        description: "Please enter a user ID to start a conversation",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const conversationId = await startDirectConversation(searchUserId.trim());
      if (conversationId) {
        setOpen(false);
        setSearchUserId('');
        toast({
          title: "Conversation started",
          description: "You can now start messaging!"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (groupName: string, participantIds: string[]) => {
    return await createGroupConversation(groupName, participantIds);
  };

  return (
    <div className="p-6 border-b border-purple-200 dark:border-purple-800">
      <div className="flex gap-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Start a Conversation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userId">Enter User ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="userId"
                    value={searchUserId}
                    onChange={(e) => setSearchUserId(e.target.value)}
                    placeholder="Enter user ID to message..."
                    className="flex-1 rounded-2xl"
                    onKeyPress={(e) => e.key === 'Enter' && handleStartDirectConversation()}
                  />
                  <Button 
                    onClick={handleStartDirectConversation}
                    disabled={loading || !searchUserId.trim()}
                    className="rounded-2xl bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? '...' : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Enter the exact user ID of the person you want to message
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <GroupCreationDialog 
          onCreateGroup={handleCreateGroup}
          trigger={
            <Button variant="outline" className="rounded-full">
              <Users className="w-4 h-4 mr-2" />
              Group
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default ConversationStarter;
