
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MessageForwardDialogProps {
  messageContent: string;
  isOpen: boolean;
  onClose: () => void;
  messagesData: ReturnType<typeof useEnhancedMessages>;
}

export const MessageForwardDialog = ({ messageContent, isOpen, onClose, messagesData }: MessageForwardDialogProps) => {
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [isForwarding, setIsForwarding] = useState(false);
  
  // messagesData is required - no fallback to prevent multiple subscriptions
  if (!messagesData) {
    console.error('MessageForwardDialog: messagesData prop is required');
    return null;
  }
  
  const { conversations, sendMessage, setSelectedConversation } = messagesData;
  const { user } = useAuth();
  const { toast } = useToast();

  const handleForward = async () => {
    if (selectedConversations.length === 0) {
      toast({
        title: "No conversations selected",
        description: "Please select at least one conversation to forward to",
        variant: "destructive"
      });
      return;
    }

    setIsForwarding(true);
    try {
      // Store the current conversation to restore it later
      const currentConversation = messagesData.selectedConversation;
      
      for (const conversationId of selectedConversations) {
        // Temporarily switch to target conversation
        setSelectedConversation(conversationId);
        
        // Wait a moment for the conversation to be set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Send the forwarded message
        await sendMessage(`🔄 Forwarded message: ${messageContent}`);
      }

      // Restore the original conversation
      if (currentConversation) {
        setSelectedConversation(currentConversation);
      }

      toast({
        title: "Message forwarded",
        description: `Message forwarded to ${selectedConversations.length} conversation(s)`
      });

      setSelectedConversations([]);
      onClose();
    } catch (error) {
      console.error('Error forwarding message:', error);
      toast({
        title: "Error",
        description: "Failed to forward message",
        variant: "destructive"
      });
    } finally {
      setIsForwarding(false);
    }
  };

  const toggleConversation = (conversationId: string) => {
    setSelectedConversations(prev =>
      prev.includes(conversationId)
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forward Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Message to forward:</p>
            <p className="text-sm">{messageContent}</p>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Select conversations:</p>
            <ScrollArea className="h-60">
              <div className="space-y-2">
                {conversations.map((conversation) => {
                  const otherParticipant = conversation.participant_1 === user?.id 
                    ? conversation.participant_2_profile
                    : conversation.participant_1_profile;

                  return (
                    <div
                      key={conversation.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => toggleConversation(conversation.id)}
                    >
                      <Checkbox
                        checked={selectedConversations.includes(conversation.id)}
                        onChange={() => toggleConversation(conversation.id)}
                      />
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={otherParticipant?.avatar_url} />
                        <AvatarFallback className="bg-purple-500 text-white text-xs">
                          {otherParticipant?.display_name?.[0] || otherParticipant?.username?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {otherParticipant?.display_name || otherParticipant?.username || 'Unknown User'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleForward}
              disabled={selectedConversations.length === 0 || isForwarding}
            >
              {isForwarding ? 'Forwarding...' : `Forward to ${selectedConversations.length} chat(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageForwardDialog;
