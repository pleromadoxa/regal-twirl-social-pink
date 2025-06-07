
import { useState, useEffect, useCallback, useRef } from 'react';
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
import { createGroupConversation } from '@/services/groupConversationService';

export const useEnhancedMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: boolean }>({});
  const channelsRef = useRef<Set<any>>(new Set());

  const clearCache = useCallback(() => {
    // Clean up all active channels
    console.log('Clearing all Supabase channels');
    channelsRef.current.forEach(channel => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.error('Error removing channel:', error);
      }
    });
    channelsRef.current.clear();
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, [clearCache]);

  const sendMessage = async (content: string) => {
    if (!user || !selectedConversation) {
      console.error('No user or selected conversation');
      return;
    }

    try {
      // Get conversation details
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (!conversation) {
        console.error('Conversation not found');
        return;
      }

      const recipientId = conversation.participant_1 === user.id 
        ? conversation.participant_2 
        : conversation.participant_1;

      console.log('Sending message:', { senderId: user.id, recipientId, content });

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
    if (!user) {
      console.error('No authenticated user');
      return;
    }

    try {
      console.log('Starting direct conversation with user:', userId);
      
      // Check if conversation already exists
      const existingConversation = await findExistingConversation(user.id, userId);

      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation.id);
        setSelectedConversation(existingConversation.id);
        return existingConversation;
      }

      // Create new conversation
      console.log('Creating new conversation');
      const newConversation = await createConversation(user.id, userId);
      console.log('Created new conversation:', newConversation.id);
      setSelectedConversation(newConversation.id);
      await refetch();
      return newConversation;
    } catch (error) {
      console.error('Error starting direct conversation:', error);
      throw error;
    }
  };

  const createGroupConversation = async (groupName: string, participantIds: string[]) => {
    if (!user) {
      console.error('No authenticated user');
      throw new Error('Authentication required');
    }

    try {
      console.log('Creating group conversation:', { groupName, participantIds, userId: user.id });
      
      const newGroup = await createGroupConversation(
        groupName,
        null, // description
        user.id,
        participantIds,
        false, // isPrivate
        50 // maxMembers
      );
      
      console.log('Group created successfully:', newGroup.id);
      
      // Refresh conversations to include the new group
      await refetch();
      
      return newGroup.id;
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
