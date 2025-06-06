import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EnhancedMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender_profile?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export interface EnhancedConversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  created_at: string;
  other_user?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  last_message?: EnhancedMessage;
}

export const useEnhancedMessages = () => {
  const [conversations, setConversations] = useState<EnhancedConversation[]>([]);
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const channelsRef = useRef<any[]>([]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      // Get enriched conversations with participant info
      const enrichedConversations = await Promise.all(
        conversationsData.map(async (conv) => {
          // Get other user for one-on-one conversation
          const otherUserId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
          
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', otherUserId)
            .single();

          return {
            ...conv,
            other_user: profileData
          };
        })
      );

      setConversations(enrichedConversations);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!user) return;

    try {
      // Get conversation details
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!conversation) return;

      // Get messages between the participants
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(
            username,
            display_name,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${conversation.participant_1},recipient_id.eq.${conversation.participant_2}),and(sender_id.eq.${conversation.participant_2},recipient_id.eq.${conversation.participant_1})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      const formattedMessages = messagesData?.map(msg => ({
        ...msg,
        sender_profile: Array.isArray(msg.sender_profile) ? msg.sender_profile[0] : msg.sender_profile
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages",
        variant: "destructive"
      });
      return;
    }

    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const recipientId = conversation.participant_1 === user.id 
        ? conversation.participant_2 
        : conversation.participant_1;

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error sending message",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully."
      });

      // Refresh messages
      fetchMessages(conversationId);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const createGroupConversation = async (groupName: string, participantIds: string[]) => {
    if (!user) return;

    try {
      // For now, create a simple conversation with the first participant
      // This is a simplified implementation until we have proper group support
      if (participantIds.length === 0) {
        toast({
          title: "Error creating group",
          description: "Please add at least one participant",
          variant: "destructive"
        });
        return;
      }

      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: participantIds[0]
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating group conversation:', error);
        toast({
          title: "Error creating group",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Conversation created",
        description: `Conversation started successfully.`
      });

      fetchConversations();
      return newConv.id;
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error creating conversation",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const startDirectConversation = async (recipientId: string) => {
    if (!user) return;

    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${recipientId}),and(participant_1.eq.${recipientId},participant_2.eq.${user.id})`)
        .single();

      if (existingConv) {
        setSelectedConversation(existingConv.id);
        return existingConv.id;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: recipientId
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return;
      }

      fetchConversations();
      setSelectedConversation(newConv.id);
      return newConv.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Clean up realtime subscriptions
  const cleanupChannels = () => {
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];
  };

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    // Clean up existing channels first
    cleanupChannels();

    const conversationsChannel = supabase
      .channel(`conversations-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel(`messages-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          if (selectedConversation) {
            fetchMessages(selectedConversation);
          }
        }
      )
      .subscribe();

    channelsRef.current = [conversationsChannel, messagesChannel];

    return cleanupChannels;
  }, [user, selectedConversation]);

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation, user]);

  return {
    conversations,
    messages,
    loading,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    createGroupConversation,
    startDirectConversation,
    refetch: fetchConversations
  };
};
