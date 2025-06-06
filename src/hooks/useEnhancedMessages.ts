
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Conversation, Message } from '@/types/messages';
import { 
  fetchConversations, 
  createConversation, 
  findExistingConversation, 
  updateConversationLastMessage 
} from '@/services/conversationService';
import { 
  fetchMessages, 
  sendMessage as sendMessageService, 
  markMessageAsRead 
} from '@/services/messageService';

export const useEnhancedMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: boolean }>({});

  const clearCache = useCallback(() => {
    const channels = supabase.getChannels();
    channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
  }, []);

  const refetch = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch conversations
      const conversationData = await fetchConversations(user.id);
      setConversations(conversationData);

      // Fetch messages for selected conversation if any
      if (selectedConversation) {
        const conversation = conversationData.find(c => c.id === selectedConversation);
        if (conversation) {
          const otherUserId = conversation.participant_1 === user.id 
            ? conversation.participant_2 
            : conversation.participant_1;

          const messageData = await fetchMessages(user.id, otherUserId);
          setMessages(messageData);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedConversation]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const sendMessage = async (content: string) => {
    if (!user || !selectedConversation) return;

    try {
      // Get conversation details
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (!conversation) return;

      const recipientId = conversation.participant_1 === user.id 
        ? conversation.participant_2 
        : conversation.participant_1;

      const newMessage = await sendMessageService(user.id, recipientId, content);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      
      // Update conversation's last_message_at
      await updateConversationLastMessage(selectedConversation);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await markMessageAsRead(messageId);

      setMessages((prevMessages) => {
        return prevMessages.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              read_at: new Date().toISOString()
            };
          }
          return msg;
        });
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const startDirectConversation = async (userId: string) => {
    try {
      console.log('Starting direct conversation with user:', userId);
      
      // Check if conversation already exists
      const existingConversation = await findExistingConversation(user?.id!, userId);

      if (existingConversation) {
        setSelectedConversation(existingConversation.id);
        return existingConversation;
      }

      // Create new conversation
      const newConversation = await createConversation(user?.id!, userId);
      setSelectedConversation(newConversation.id);
      await refetch();
      return newConversation;
    } catch (error) {
      console.error('Error starting direct conversation:', error);
      throw error;
    }
  };

  const createGroupConversation = async (participantIds: string[], groupName?: string) => {
    try {
      console.log('Creating group conversation with participants:', participantIds);
      
      // For now, just create a simple conversation with the first participant
      if (participantIds.length > 0) {
        return await startDirectConversation(participantIds[0]);
      }
      
      throw new Error('No participants provided');
    } catch (error) {
      console.error('Error creating group conversation:', error);
      throw error;
    }
  };

  return {
    conversations,
    messages,
    loading,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    markAsRead,
    refetch,
    clearCache,
    startDirectConversation,
    createGroupConversation,
    activeCall,
    setActiveCall,
    typingUsers,
    setTypingUsers
  };
};
