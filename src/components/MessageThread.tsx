
import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical } from 'lucide-react';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import CallHistoryDialog from '@/components/CallHistoryDialog';
import EnhancedMessageComposer from '@/components/EnhancedMessageComposer';
import MessageAttachments from '@/components/MessageAttachments';
import RealTimeCallManager from '@/components/RealTimeCallManager';
import { uploadMessageAttachment, createMessageAttachment } from '@/services/attachmentService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface MessageThreadProps {
  conversationId: string;
}

const MessageThread = ({ conversationId }: MessageThreadProps) => {
  const {
    messages,
    sendMessage,
    markAsRead,
    selectedConversation,
    setSelectedConversation,
    conversations,
    typingUsers,
    refetch
  } = useEnhancedMessages();

  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (conversationId && selectedConversation !== conversationId) {
      console.log('Setting selected conversation to:', conversationId);
      setSelectedConversation(conversationId);
    }
  }, [conversationId, selectedConversation, setSelectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time messaging setup
  useEffect(() => {
    if (!conversationId) return;

    const currentConversation = conversations.find(c => c.id === conversationId);
    if (!currentConversation) return;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const otherUserId = currentConversation.participant_1 === user.id 
        ? currentConversation.participant_2 
        : currentConversation.participant_1;

      // Subscribe to real-time messages
      const messagesChannel = supabase
        .channel(`messages-${conversationId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id}))`
        }, () => {
          console.log('New message received, refreshing...');
          refetch();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
      };
    };

    setupRealtime();
  }, [conversationId, conversations, refetch]);

  const handleSendMessage = async (content: string, attachments: File[] = []) => {
    if ((!content.trim() && attachments.length === 0) || sendingMessage || !user) return;

    setSendingMessage(true);
    try {
      console.log('Sending message with attachments:', { content, attachments: attachments.length });
      
      // Send the message first
      await sendMessage(content.trim());
      
      // If there are attachments, upload them and link to the message
      if (attachments.length > 0) {
        // Get the latest message to attach files to
        const latestMessages = messages.filter(m => m.sender_id === user.id).slice(-1);
        const messageId = latestMessages[0]?.id;
        
        if (messageId) {
          for (const file of attachments) {
            try {
              const attachmentType = file.type.startsWith('image/') ? 'image' :
                                   file.type.startsWith('video/') ? 'video' :
                                   file.type.startsWith('audio/') ? 'audio' : 'document';
              
              const fileUrl = await uploadMessageAttachment(file, user.id, attachmentType);
              
              await createMessageAttachment(
                messageId,
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
      }
      
      // Refresh to show attachments
      refetch();
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const currentConversation = conversations.find(c => c.id === conversationId);
  const otherUser = currentConversation?.other_user;

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500">Select a conversation to start messaging</p>
      </div>
    );
  }

  const participants = [
    {
      id: currentConversation.participant_1,
      username: currentConversation.participant_1_profile?.username || 'user1',
      display_name: currentConversation.participant_1_profile?.display_name || 'User 1',
      avatar_url: currentConversation.participant_1_profile?.avatar_url || ''
    },
    {
      id: currentConversation.participant_2,
      username: currentConversation.participant_2_profile?.username || 'user2',
      display_name: currentConversation.participant_2_profile?.display_name || 'User 2',
      avatar_url: currentConversation.participant_2_profile?.avatar_url || ''
    }
  ].filter(p => p.id !== user?.id);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUser?.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {otherUser?.display_name?.[0] || otherUser?.username?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {otherUser?.display_name || otherUser?.username || 'Unknown User'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {typingUsers[conversationId] ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <RealTimeCallManager
            conversationId={conversationId}
            participants={participants}
          />
          <CallHistoryDialog />
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-600 hover:text-purple-600 dark:text-slate-400"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.sender_id !== otherUser?.id;
            const sender = message.sender_profile;
            
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                onMouseEnter={() => !message.read_at && markAsRead(message.id)}
              >
                {!isOwn && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={sender?.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                      {sender?.display_name?.[0] || sender?.username?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : ''}`}>
                  <div className={`px-4 py-2 rounded-2xl ${
                    isOwn 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                  }`}>
                    <p className="text-sm break-words">{message.content}</p>
                  </div>
                  
                  {/* Message Attachments */}
                  <MessageAttachments messageId={message.id} />
                  
                  <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    {isOwn && message.read_at && (
                      <span className="ml-1 text-purple-500">✓✓</span>
                    )}
                  </p>
                </div>

                {isOwn && (
                  <Avatar className="w-8 h-8 flex-shrink-0 order-2">
                    <AvatarImage src={sender?.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                      {sender?.display_name?.[0] || sender?.username?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Enhanced Message Input */}
      <div className="p-4 border-t border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
        <EnhancedMessageComposer
          onSendMessage={handleSendMessage}
          disabled={sendingMessage}
          placeholder="Type a message..."
        />
      </div>
    </div>
  );
};

export default MessageThread;
