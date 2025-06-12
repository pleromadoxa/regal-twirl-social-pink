import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchConversations } from '@/services/conversationService';
import type { Conversation, Message } from '@/types/messages';

export const useMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversationsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const conversationsData = await fetchConversations(user.id);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!user) return;

    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Transform the data to match the Message interface
      const formattedMessages: Message[] = (messagesData || []).map(msg => ({
        ...msg,
        conversation_id: conversationId,
        message_type: 'text' as const,
        attachments: [],
        profiles: undefined,
        sender_profile: undefined
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    }
  };

  const sendMessage = async (recipientId: string, content: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages",
        variant: "destructive"
      });
      return;
    }

    try {
      // First, create or get conversation
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${recipientId}),and(participant_1.eq.${recipientId},participant_2.eq.${user.id})`)
        .single();

      let conversationId = existingConv?.id;

      if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            participant_1: user.id,
            participant_2: recipientId
          })
          .select('id')
          .single();

        if (convError) {
          console.error('Error creating conversation:', convError);
          return;
        }

        conversationId = newConv.id;
      }

      // Send the message
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

      // Refresh conversations and messages
      fetchConversationsData();
      if (selectedConversation) {
        fetchMessages(selectedConversation);
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchConversationsData();
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
    refetch: fetchConversationsData
  };
};
