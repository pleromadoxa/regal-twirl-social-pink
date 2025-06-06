
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  sender_profile?: UserProfile;
}

interface Conversation {
  id: string;
  created_at: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  last_message: Message | null;
  other_user: UserProfile | null;
  streak_count: number;
  group_name?: string | null;
}

export const useEnhancedMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
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
      // Fetch conversations with participants
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1_profile:profiles!conversations_participant_1_fkey(
            id,
            username,
            display_name,
            avatar_url
          ),
          participant_2_profile:profiles!conversations_participant_2_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (conversationError) {
        console.error("Error fetching conversations:", conversationError);
        return;
      }

      if (conversationData) {
        // Process conversations to add other_user info
        const processedConversations: Conversation[] = conversationData.map(conv => ({
          ...conv,
          other_user: conv.participant_1 === user.id 
            ? (conv.participant_2_profile as UserProfile) 
            : (conv.participant_1_profile as UserProfile),
          last_message: null,
          streak_count: 0
        }));
        setConversations(processedConversations);
      }

      // Fetch messages for selected conversation
      if (selectedConversation) {
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select(`
            *,
            sender_profile:profiles!messages_sender_id_fkey(
              id,
              username,
              display_name,
              avatar_url
            )
          `)
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},recipient_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (messageError) {
          console.error("Error fetching messages:", messageError);
          return;
        }

        if (messageData) {
          setMessages(messageData as Message[]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user, selectedConversation]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new) {
            // Add new message to current conversation
            const newMessage = payload.new as Message;
            if ((newMessage.sender_id === user.id || newMessage.recipient_id === user.id)) {
              setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedConversation, refetch]);

  const sendMessage = async (recipientId: string, content: string, attachments?: any) => {
    if (!user || !recipientId) return;

    try {
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content,
        })
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error("Error sending message:", error);
        return;
      }

      if (newMessage) {
        setMessages((prevMessages) => [...prevMessages, newMessage as Message]);
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

      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, read_at: new Date().toISOString() };
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
        .single();

      if (existingConversation) {
        setSelectedConversation(userId);
        return existingConversation;
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: user?.id,
          participant_2: userId,
        })
        .select()
        .single();

      if (error) throw error;

      setSelectedConversation(userId);
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
      
      // For now, create a simple conversation with the first participant
      if (participantIds.length > 0) {
        return await startDirectConversation(participantIds[0]);
      }
      
      throw new Error('No participants provided');
    } catch (error) {
      console.error('Error creating group conversation:', error);
      throw error;
    }
  };

  const sendTypingIndicator = async (recipientId: string, isTyping: boolean) => {
    // Implement typing indicator logic
    setTypingUsers(prev => ({
      ...prev,
      [recipientId]: isTyping
    }));
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
    sendTypingIndicator,
    typingUsers
  };
};
