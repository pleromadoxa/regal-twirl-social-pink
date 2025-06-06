import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_profile?: UserProfile;
}

interface Conversation {
  id: string;
  created_at: string;
  user1_id: string;
  user2_id: string;
  conversation_type: string;
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

  const clearCache = useCallback(() => {
    supabase.removeChannel('*');
  }, []);

  const refetch = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch conversations
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select(`
          *,
          last_message:messages(
            id,
            created_at,
            sender_id,
            content,
            sender_profile:sender_id (
              id,
              username,
              display_name,
              avatar_url
            )
          ),
          other_user: user_profiles!conversations_user2_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (conversationError) {
        console.error("Error fetching conversations:", conversationError);
        return;
      }

      if (conversationData) {
        setConversations(conversationData);
      }

      // Fetch messages for selected conversation
      if (selectedConversation) {
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select(`
            *,
            sender_profile:sender_id (
              id,
              username,
              display_name,
              avatar_url
            )
          `)
          .eq('conversation_id', selectedConversation)
          .order('created_at', { ascending: true });

        if (messageError) {
          console.error("Error fetching messages:", messageError);
          return;
        }

        if (messageData) {
          setMessages(messageData);
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
            setMessages((prevMessages) => {
              // Check if the new message belongs to the currently selected conversation
              if (payload.new.conversation_id === selectedConversation) {
                return [...prevMessages, {
                  ...payload.new,
                  sender_profile: payload.new.sender_id // Assuming sender_profile is same as sender_id for new messages
                }];
              }
              return prevMessages;
            });

            // Optimistically update last message in conversations
            setConversations(prevConversations => {
              return prevConversations.map(conv => {
                if (conv.id === payload.new.conversation_id) {
                  return {
                    ...conv,
                    last_message: payload.new as Message,
                    last_message_at: payload.new.created_at
                  };
                }
                return conv;
              });
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        (payload) => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedConversation, refetch]);

  const sendMessage = async (content: string) => {
    if (!user || !selectedConversation) return;

    try {
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: content,
        })
        .select(`
          *,
          sender_profile:sender_id (
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
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // Optimistically update last message in conversations
        setConversations(prevConversations => {
          return prevConversations.map(conv => {
            if (conv.id === selectedConversation) {
              return {
                ...conv,
                last_message: newMessage as Message,
                last_message_at: newMessage.created_at
              };
            }
            return conv;
          });
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, is_read: true };
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
        .or(`and(user1_id.eq.${user?.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${user?.id})`)
        .single();

      if (existingConversation) {
        setSelectedConversation(existingConversation.id);
        return existingConversation;
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          user1_id: user?.id,
          user2_id: userId,
          conversation_type: 'direct'
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
      
      // Create group conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          user1_id: user?.id,
          conversation_type: 'group',
          group_name: groupName || 'Group Chat'
        })
        .select()
        .single();

      if (error) throw error;

      // Add participants
      const participantInserts = participantIds.map(participantId => ({
        conversation_id: newConversation.id,
        user_id: participantId
      }));

      await supabase
        .from('conversation_participants')
        .insert(participantInserts);

      setSelectedConversation(newConversation.id);
      await refetch();
      return newConversation;
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
    createGroupConversation
  };
};
