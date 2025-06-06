
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  read_at: string | null;
  sender_profile: UserProfile | null;
}

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  last_message_at: string | null;
  participant_1_profile: UserProfile | null;
  participant_2_profile: UserProfile | null;
  other_user: UserProfile | null;
  last_message: Message | null;
  streak_count: number;
}

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
      // Fetch conversations with user profiles
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1_profile:participant_1(id, username, display_name, avatar_url),
          participant_2_profile:participant_2(id, username, display_name, avatar_url)
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (conversationError) {
        console.error("Error fetching conversations:", conversationError);
        return;
      }

      if (conversationData) {
        const processedConversations: Conversation[] = conversationData.map(conv => {
          const otherUser = conv.participant_1 === user.id 
            ? conv.participant_2_profile 
            : conv.participant_1_profile;
          
          return {
            ...conv,
            other_user: otherUser,
            last_message: null,
            streak_count: 0
          };
        });

        setConversations(processedConversations);
      }

      // Fetch messages for selected conversation if any
      if (selectedConversation) {
        const conversation = conversationData?.find(c => c.id === selectedConversation);
        if (conversation) {
          const otherUserId = conversation.participant_1 === user.id 
            ? conversation.participant_2 
            : conversation.participant_1;

          const { data: messageData, error: messageError } = await supabase
            .from('messages')
            .select(`
              *,
              sender_profile:sender_id(id, username, display_name, avatar_url)
            `)
            .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
            .order('created_at', { ascending: true });

          if (messageError) {
            console.error("Error fetching messages:", messageError);
            return;
          }

          if (messageData) {
            setMessages(messageData);
          }
        }
      }
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

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content
        })
        .select(`
          *,
          sender_profile:sender_id(id, username, display_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error("Error sending message:", error);
        return;
      }

      if (newMessage) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        
        // Update conversation's last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', selectedConversation);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);

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
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1.eq.${user?.id},participant_2.eq.${userId}),and(participant_1.eq.${userId},participant_2.eq.${user?.id})`)
        .maybeSingle();

      if (existingConversation) {
        setSelectedConversation(existingConversation.id);
        return existingConversation;
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: user?.id,
          participant_2: userId
        })
        .select()
        .single();

      if (error) throw error;

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
