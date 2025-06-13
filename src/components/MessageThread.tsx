import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreVertical, Trash2 } from 'lucide-react';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { supabase } from '@/integrations/supabase/client';
import CallHistoryDialog from '@/components/CallHistoryDialog';
import EnhancedMessageComposer from '@/components/EnhancedMessageComposer';
import RealTimeCallManager from '@/components/RealTimeCallManager';
import EnhancedChatBubble from '@/components/EnhancedChatBubble';
import { uploadMessageAttachment, createMessageAttachment } from '@/services/attachmentService';
import { deleteMessage } from '@/services/messageService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import PresenceIndicator from './PresenceIndicator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);
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
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'messages'
        }, () => {
          console.log('Message deleted, refreshing...');
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

  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return;
    
    setDeletingMessage(messageId);
    try {
      await deleteMessage(messageId, user.id);
      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully.",
      });
      refetch();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error deleting message",
        description: "You can only delete your own messages.",
        variant: "destructive"
      });
    } finally {
      setDeletingMessage(null);
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
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-white/80 to-purple-50/30 dark:from-slate-800/80 dark:to-purple-900/30">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-6 border-b border-purple-200/50 dark:border-purple-800/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-12 h-12 ring-2 ring-purple-200 dark:ring-purple-800">
              <AvatarImage src={otherUser?.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {otherUser?.display_name?.[0] || otherUser?.username?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              <PresenceIndicator userId={otherUser?.id || ''} />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
              {otherUser?.display_name || otherUser?.username || 'Unknown User'}
            </h3>
            <div className="flex items-center gap-2">
              <PresenceIndicator userId={otherUser?.id || ''} showText />
              {typingUsers[conversationId] && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-purple-600 dark:text-purple-400"
                >
                  is typing...
                </motion.span>
              )}
            </div>
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
            className="text-slate-600 hover:text-purple-600 dark:text-slate-400 hover:bg-purple-100 dark:hover:bg-purple-900/20"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      {/* Enhanced Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          <AnimatePresence>
            {messages.map((message) => {
              const isOwn = message.sender_id !== otherUser?.id;
              
              return (
                <EnhancedChatBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  onReply={() => {
                    // Handle reply functionality
                    console.log('Reply to message:', message.id);
                  }}
                  onMore={() => {
                    if (isOwn) {
                      handleDeleteMessage(message.id);
                    }
                  }}
                />
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Enhanced Message Input */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-t border-purple-200/50 dark:border-purple-800/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl"
      >
        <div className="max-w-4xl mx-auto">
          <EnhancedMessageComposer
            onSendMessage={handleSendMessage}
            disabled={sendingMessage}
            placeholder="Type a message..."
          />
        </div>
      </motion.div>
    </div>
  );
};

export default MessageThread;
