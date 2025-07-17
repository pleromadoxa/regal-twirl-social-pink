
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchConversations, createConversation, type Conversation } from '@/services/conversationService';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location';
  created_at: string;
  read_at?: string;
  edited_at?: string;
  metadata?: any;
}

export const useEnhancedMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversationsData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching conversations for user:', user.id);
      setLoading(true);
      const conversationsData = await fetchConversations(user.id);
      console.log('Fetched conversations:', conversationsData);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error loading conversations",
        description: "Please try refreshing the page",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!user || !conversationId) return;

    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${conversation.participant_1 === user.id ? conversation.participant_2 : conversation.participant_1}),and(sender_id.eq.${conversation.participant_1 === user.id ? conversation.participant_2 : conversation.participant_1},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Transform the data to match the Message interface
      const transformedMessages: Message[] = (messagesData || []).map(msg => ({
        ...msg,
        message_type: (msg.message_type as 'text' | 'image' | 'video' | 'audio' | 'document' | 'location') || 'text'
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !selectedConversation || !content.trim()) {
      return;
    }

    try {
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (!conversation) return;

      const recipientId = conversation.participant_1 === user.id 
        ? conversation.participant_2 
        : conversation.participant_1;

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim(),
          message_type: 'text'
        })
        .select()
        .single();

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
        .eq('id', selectedConversation);

      // Refresh messages and conversations
      await fetchMessages(selectedConversation);
      await fetchConversationsData();

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully."
      });

      return data;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_id', user.id);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const startDirectConversation = async (userId: string) => {
    if (!user || userId === user.id) return;

    try {
      const conversation = await createConversation(user.id, userId);
      await fetchConversationsData();
      setSelectedConversation(conversation.id);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error starting conversation",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const createGroupConversation = async (userIds: string[], groupName: string) => {
    // Implementation for group conversations
    console.log('Creating group conversation:', { userIds, groupName });
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
    markAsRead,
    refetch: fetchConversationsData,
    startDirectConversation,
    createGroupConversation
  };
};
