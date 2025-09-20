
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useToast } from '@/hooks/use-toast';
import { uploadMessageAttachment, createMessageAttachment } from '@/services/messageAttachmentService';
import MessageThreadHeader from './MessageThreadHeader';
import MessageThreadMessages from './MessageThreadMessages';
import MessageThreadInput from './MessageThreadInput';
import MessageThreadCallManager from './MessageThreadCallManager';

interface MessageThreadProps {
  conversationId: string;
  messagesData: ReturnType<typeof useEnhancedMessages>;
  onCallStart?: (callType: 'audio' | 'video', otherUser: any) => void;
}

export const MessageThread = ({ conversationId, messagesData, onCallStart }: MessageThreadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // messagesData is required - no fallback to prevent multiple subscriptions
  if (!messagesData) {
    console.error('MessageThread: messagesData prop is required');
    return null;
  }
  
  const { 
    messages, 
    sendMessage, 
    markAsRead, 
    conversations, 
    groupConversations,
    setSelectedConversation 
  } = messagesData;
  const [localMessages, setLocalMessages] = useState(messages);

  // Get conversation details - check both regular and group conversations
  const conversation = conversations.find(c => c.id === conversationId);
  const groupConversation = groupConversations.find(g => g.id === conversationId);
  
  const isGroupConversation = !!groupConversation;
  const activeConversation = conversation || groupConversation;
  
  const otherParticipant = conversation 
    ? (conversation.participant_1 === user?.id 
        ? conversation.participant_2_profile 
        : conversation.participant_1_profile)
    : null;

  // Guard: If conversationId is not present or invalid, don't render input
  const isConversationIdValid = !!conversationId;
  const isConversationValid = !!activeConversation && (!!otherParticipant || isGroupConversation);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Ensure hook's internal selectedConversation is always in sync with prop
  useEffect(() => {
    if (conversationId) {
      setSelectedConversation(conversationId);
    }
  }, [conversationId, setSelectedConversation]);

  const handleSendMessage = async (content: string, attachments: File[] = [], sharedLocation?: {lat: number; lng: number; address: string}) => {
    if (!content.trim() && attachments.length === 0 && !sharedLocation) return;
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to send messages",
        variant: "destructive"
      });
      return;
    }
    // Guard if conversation id is missing
    if (!conversationId) {
      toast({
        title: "Error",
        description: "No conversation selected. Please select a conversation before sending a message.",
        variant: "destructive"
      });
      return;
    }
    try {
      let messageContent = content;
      let messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' = 'text';
      let metadata: any = {};

      // Handle location sharing
      if (sharedLocation) {
        messageContent = `📍 Shared location: ${sharedLocation.address}`;
        messageType = 'location';
        metadata = { location: sharedLocation };
      }

      // Send the message first
      const message = await sendMessage(messageContent);
      
      if (!message) {
        throw new Error('Failed to send message');
      }
      
      // Handle file attachments
      if (attachments.length > 0) {
        for (const file of attachments) {
          try {
            const fileUrl = await uploadMessageAttachment(file, user.id);
            
            let attachmentType: 'image' | 'video' | 'audio' | 'document' = 'document';
            if (file.type.startsWith('image/')) attachmentType = 'image';
            else if (file.type.startsWith('video/')) attachmentType = 'video';
            else if (file.type.startsWith('audio/')) attachmentType = 'audio';

            await createMessageAttachment(
              message.id,
              file.name,
              file.type,
              file.size,
              fileUrl,
              attachmentType
            );
          } catch (error) {
            console.error('Error uploading attachment:', error);
            toast({
              title: "Attachment upload failed",
              description: `Failed to upload ${file.name}`,
              variant: "destructive"
            });
          }
        }
      }

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully"
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setLocalMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  if (!isConversationIdValid) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-muted-foreground pt-16">
        <p className="mb-3">No conversation selected</p>
        <p className="text-sm text-slate-400">Please select a conversation first to send or view messages.</p>
      </div>
    );
  }

  if (!isConversationValid) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Conversation not found</p>
      </div>
    );
  }

  return (
    <MessageThreadCallManager
      conversationId={conversationId}
      currentUserId={user?.id}
      otherParticipant={otherParticipant}
      onCallStart={(callType) => {
        if (onCallStart && otherParticipant) {
          onCallStart(callType, otherParticipant);
        }
      }}
    >
      {(initiateCall) => (
        <div className="flex flex-col h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-l border-r border-purple-200 dark:border-purple-800 pb-20 md:pb-0">
          {/* Header */}
          <MessageThreadHeader
            otherParticipant={otherParticipant}
            conversation={conversation}
            groupConversation={groupConversation}
            isGroupConversation={isGroupConversation}
            onAudioCall={() => initiateCall('audio')}
            onVideoCall={() => initiateCall('video')}
            onGroupUpdated={() => {
              // Refresh the group conversation data
              window.location.reload(); // Simple refresh for now
            }}
          />

          {/* Messages */}
          <MessageThreadMessages
            messages={localMessages}
            currentUserId={user?.id}
            conversationId={conversationId || ''}
            isGroup={isGroupConversation}
            onDeleteMessage={handleDeleteMessage}
          />

          {/* Message Input */}
          <MessageThreadInput
            onSendMessage={handleSendMessage}
            disabled={false}
          />
        </div>
      )}
    </MessageThreadCallManager>
  );
};

export default MessageThread;
