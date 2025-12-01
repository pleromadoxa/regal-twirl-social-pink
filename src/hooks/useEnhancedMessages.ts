import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchConversations, createConversation } from '@/services/conversationService';
import type { Conversation, Message } from '@/types/messages';
import { subscriptionManager } from '@/utils/subscriptionManager';

export const useEnhancedMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversationsData = async () => {
    if (!user) {
      console.log('No user found, skipping conversation fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('=== Starting conversation fetch for user:', user.id, '===');
      setLoading(true);
      
      // Fetch direct conversations
      const conversationsData = await fetchConversations(user.id);
      
      console.log('Fetched direct conversations:', conversationsData?.length || 0);
      
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

  // Set up real-time subscriptions using subscription manager
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscriptions for user:', user.id);
    
    // Create direct subscription without subscription manager for now
    const channelName = `conversations-changes-${user.id}-${Date.now()}`;
    
    const channel = supabase.channel(channelName);
    // Set up postgres change listeners
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'conversations'
    }, () => {
      console.log('Conversation change detected, refetching...');
      fetchConversationsData();
    });

    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'messages',
      filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`
    }, () => {
      console.log('Message change detected, refetching...');
      if (selectedConversation) {
        fetchMessages(selectedConversation);
      }
    });

    channel.subscribe((status: string) => {
      console.log('Channel subscription status:', status);
    });

    return () => {
      console.log('Cleaning up real-time subscriptions for user:', user.id);
      try {
        channel.unsubscribe();
        supabase.removeChannel(channel);
      } catch (error) {
        console.error('Error cleaning up channel:', error);
      }
    };
  }, [user?.id]); // Removed selectedConversation to prevent multiple subscriptions

  const fetchMessages = async (conversationId: string) => {
    if (!user || !conversationId) return;

    try {
      // Fetch direct messages
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const otherParticipant = conversation.participant_1 === user.id 
        ? conversation.participant_2 
        : conversation.participant_1;

      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherParticipant}),and(sender_id.eq.${otherParticipant},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Fetch sender profiles separately
      const senderIds = [...new Set(messagesData?.map(m => m.sender_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', senderIds);

      // Fetch attachments for all messages
      const messageIds = messagesData?.map(m => m.id) || [];
      const { data: attachmentsData } = await supabase
        .from('message_attachments')
        .select('*')
        .in('message_id', messageIds);

      const transformedMessages: Message[] = (messagesData || []).map(msg => {
        const senderProfile = profiles?.find(p => p.id === msg.sender_id);
        const messageAttachments = (attachmentsData?.filter(a => a.message_id === msg.id) || []).map(att => ({
          ...att,
          attachment_type: att.attachment_type as 'image' | 'video' | 'audio' | 'document'
        }));
        
        return {
          ...msg,
          message_type: (msg.message_type as 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'missed_call') || 'text',
          sender_profile: senderProfile,
          attachments: messageAttachments
        };
      });

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    }
  };

  const sendMessage = async (
    content: string, 
    messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'missed_call' = 'text', 
    metadata: any = {},
    attachments: File[] = []
  ) => {
    if (!user || !selectedConversation) {
      return;
    }

    // Allow sending if there's content or attachments
    if (!content.trim() && attachments.length === 0) {
      return;
    }

    try {
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (!conversation) return;

      const recipientId = conversation.participant_1 === user.id 
        ? conversation.participant_2 
        : conversation.participant_1;

      // Create the message first
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim() || 'Sent an attachment',
          message_type: messageType,
          metadata: Object.keys(metadata).length > 0 ? metadata : null
        })
        .select()
        .single();

      if (messageError) {
        console.error('Error sending message:', messageError);
        toast({
          title: "Error sending message",
          description: messageError.message,
          variant: "destructive"
        });
        return;
      }

      // Upload attachments if any
      if (attachments.length > 0) {
        for (const file of attachments) {
          try {
            // Upload file to storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('message-attachments')
              .upload(fileName, file);

            if (uploadError) {
              console.error('Error uploading file:', uploadError);
              continue;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('message-attachments')
              .getPublicUrl(uploadData.path);

            // Determine attachment type
            let attachmentType: 'image' | 'video' | 'audio' | 'document' = 'document';
            if (file.type.startsWith('image/')) attachmentType = 'image';
            else if (file.type.startsWith('video/')) attachmentType = 'video';
            else if (file.type.startsWith('audio/')) attachmentType = 'audio';

            // Create attachment record
            await supabase
              .from('message_attachments')
              .insert({
                message_id: messageData.id,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                file_url: publicUrl,
                attachment_type: attachmentType
              });

          } catch (error) {
            console.error('Error processing attachment:', error);
          }
        }
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
        description: attachments.length > 0 ? "Message and attachments sent successfully." : "Your message has been sent successfully."
      });

      return messageData;
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
    if (!user || userId === user.id) return null;

    try {
      const conversation = await createConversation(user.id, userId);
      await fetchConversationsData();
      setSelectedConversation(conversation.id);
      return conversation.id; // Return the conversation ID
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error starting conversation",
        description: "Please try again later.",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchConversationsData();
  }, [user?.id]); // Only depend on user ID, not entire user object

  useEffect(() => {
    if (selectedConversation && user?.id) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation, user?.id]); // Only depend on user ID, not entire user object

  return {
    conversations,
    groupConversations: [], // Return empty array for compatibility
    messages,
    loading,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    markAsRead,
    refetch: fetchConversationsData,
    startDirectConversation,
    createGroupConversation: async () => {} // Empty function for compatibility
  };
};
