
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  Smile
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VideoCall from './VideoCall';
import EnhancedAudioCall from './EnhancedAudioCall';
import EnhancedMessageBubble from './EnhancedMessageBubble';
import AttachmentUpload from './AttachmentUpload';
import { uploadMessageAttachment, createMessageAttachment } from '@/services/messageAttachmentService';

interface MessageThreadProps {
  conversationId: string;
}

const MessageThread = ({ conversationId }: MessageThreadProps) => {
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead, conversations } = useEnhancedMessages();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sharedLocation, setSharedLocation] = useState<{lat: number; lng: number; address: string} | null>(null);
  const [activeCall, setActiveCall] = useState<{
    type: 'audio' | 'video';
    otherUserId: string;
    otherUserName: string;
    otherUserAvatar?: string;
  } | null>(null);
  const [localMessages, setLocalMessages] = useState(messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get conversation details
  const conversation = conversations.find(c => c.id === conversationId);
  const otherParticipant = conversation 
    ? (conversation.participant_1 === user?.id 
        ? conversation.participant_2_profile 
        : conversation.participant_1_profile)
    : null;

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0 && !sharedLocation) return;
    
    try {
      let messageContent = newMessage.trim();
      let messageType = 'text';
      let metadata: any = {};

      // Handle location sharing
      if (sharedLocation) {
        messageContent = `📍 Shared location: ${sharedLocation.address}`;
        messageType = 'location';
        metadata = { location: sharedLocation };
      }

      // Send the message first
      const message = await sendMessage(messageContent);
      
      // Handle file attachments
      if (attachments.length > 0 && user) {
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

      // Reset form
      setNewMessage('');
      setAttachments([]);
      setSharedLocation(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setLocalMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const initiateCall = async (callType: 'audio' | 'video') => {
    if (!user || !otherParticipant) {
      toast({
        title: "Error",
        description: "Cannot start call",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create call record
      const { data: callData, error } = await supabase
        .from('active_calls')
        .insert({
          caller_id: user.id,
          call_type: callType,
          participants: [user.id, otherParticipant.id],
          room_id: `call-${Date.now()}-${user.id}`
        })
        .select()
        .single();

      if (error) throw error;

      setActiveCall({
        type: callType,
        otherUserId: otherParticipant.id,
        otherUserName: otherParticipant.display_name || otherParticipant.username,
        otherUserAvatar: otherParticipant.avatar_url
      });

      toast({
        title: `${callType === 'video' ? 'Video' : 'Audio'} call started`,
        description: `Calling ${otherParticipant.display_name || otherParticipant.username}...`
      });
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: "Failed to start call",
        variant: "destructive"
      });
    }
  };

  const endCall = () => {
    setActiveCall(null);
  };

  if (!conversation || !otherParticipant) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Conversation not found</p>
      </div>
    );
  }

  // Render active call
  if (activeCall) {
    if (activeCall.type === 'video') {
      return (
        <VideoCall
          conversationId={conversationId}
          otherUserId={activeCall.otherUserId}
          otherUserName={activeCall.otherUserName}
          otherUserAvatar={activeCall.otherUserAvatar}
          onCallEnd={endCall}
        />
      );
    } else {
      return (
        <EnhancedAudioCall
          conversationId={conversationId}
          otherUserId={activeCall.otherUserId}
          otherUserName={activeCall.otherUserName}
          otherUserAvatar={activeCall.otherUserAvatar}
          onCallEnd={endCall}
        />
      );
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-purple-200 dark:border-purple-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherParticipant.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {(otherParticipant.display_name || otherParticipant.username || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                {otherParticipant.display_name || otherParticipant.username}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                @{otherParticipant.username}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => initiateCall('audio')}
              className="rounded-full"
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => initiateCall('video')}
              className="rounded-full"
            >
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {conversation.streak_count && conversation.streak_count > 0 && (
          <div className="mt-2">
            <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
              🔥 {conversation.streak_count} day streak
            </Badge>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {localMessages.length > 0 ? (
          <div className="space-y-4">
            {localMessages.map((message) => (
              <EnhancedMessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === user?.id}
                currentUserId={user?.id || ''}
                onDelete={handleDeleteMessage}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-slate-500">No messages yet</p>
              <p className="text-sm text-slate-400 mt-1">Start the conversation!</p>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-purple-200 dark:border-purple-800 p-4 space-y-3">
        {/* Attachment Upload */}
        <AttachmentUpload
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          onLocationSelect={setSharedLocation}
        />

        {/* Location Preview */}
        {sharedLocation && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm">📍 Location: {sharedLocation.address}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSharedLocation(null)}
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="rounded-full">
            <Smile className="w-4 h-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-slate-100 dark:bg-slate-800 border-0"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && attachments.length === 0 && !sharedLocation}
            className="rounded-full w-10 h-10 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
