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
  const conversationsChannelRef = useRef<any>(null);
  const messagesChannelRef = useRef<any>(null);

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

      // Get enriched conversations with participant info and last message
      const enrichedConversations = await Promise.all(
        conversationsData.map(async (conv) => {
          // Get other user for one-on-one conversation
          const otherUserId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
          
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', otherUserId)
            .single();

          // Get last message for this conversation with sender profile
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${conv.participant_1},recipient_id.eq.${conv.participant_2}),and(sender_id.eq.${conv.participant_2},recipient_id.eq.${conv.participant_1})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          let lastMessageWithProfile = undefined;
          if (lastMessageData) {
            // Get sender profile for last message
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('username, display_name, avatar_url')
              .eq('id', lastMessageData.sender_id)
              .single();

            lastMessageWithProfile = {
              ...lastMessageData,
              sender_profile: senderProfile
            };
          }

          return {
            ...conv,
            other_user: profileData,
            last_message: lastMessageWithProfile
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
      // Get conversation details first
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!conversation) {
        console.error('Conversation not found:', conversationId);
        return;
      }

      console.log('Fetching messages for conversation:', conversation);

      // Get messages between the participants
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${conversation.participant_1},recipient_id.eq.${conversation.participant_2}),and(sender_id.eq.${conversation.participant_2},recipient_id.eq.${conversation.participant_1})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Get sender profiles for all messages
      const messagesWithProfiles = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url')
            .eq('id', msg.sender_id)
            .single();

          return {
            ...msg,
            sender_profile: senderProfile
          };
        })
      );

      console.log('Fetched messages for conversation:', conversationId, messagesWithProfiles);
      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    }
  };

  const sendMessage = async (conversationId: string, content: string, attachments?: { images: File[], videos: File[] }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim() && (!attachments || (attachments.images.length === 0 && attachments.videos.length === 0))) {
      toast({
        title: "Message cannot be empty",
        description: "Please enter a message or attach files before sending",
        variant: "destructive"
      });
      return;
    }

    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) {
        console.error('Conversation not found:', conversationId);
        return;
      }

      const recipientId = conversation.participant_1 === user.id 
        ? conversation.participant_2 
        : conversation.participant_1;

      console.log('Sending message:', { conversationId, recipientId, content: content.trim() });

      const { data: messageData, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim()
        })
        .select('*')
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

      console.log('Message sent successfully:', messageData);

      // Update conversation last_message_at
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (updateError) {
        console.error('Error updating conversation:', updateError);
      }

      // Get sender profile for the message
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url')
        .eq('id', user.id)
        .single();

      // Immediately add the message to the local state for instant feedback
      const formattedMessage = {
        ...messageData,
        sender_profile: senderProfile
      };
      
      setMessages(prev => [...prev, formattedMessage]);

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully."
      });

      // Refresh conversations to update last message
      await fetchConversations();
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

  // Clean up function for channels
  const cleanupChannels = () => {
    console.log('Cleaning up channels...');
    
    if (conversationsChannelRef.current) {
      console.log('Removing conversations channel');
      supabase.removeChannel(conversationsChannelRef.current);
      conversationsChannelRef.current = null;
    }
    
    if (messagesChannelRef.current) {
      console.log('Removing messages channel');
      supabase.removeChannel(messagesChannelRef.current);
      messagesChannelRef.current = null;
    }
  };

  // Set up realtime subscriptions for conversations
  useEffect(() => {
    if (!user) {
      cleanupChannels();
      return;
    }

    // Clean up any existing channels
    cleanupChannels();

    console.log('Setting up conversations channel for user:', user.id);

    // Create conversations channel
    const conversationChannelName = `conversations-${user.id}-${Date.now()}`;
    
    try {
      const conversationsChannel = supabase
        .channel(conversationChannelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations'
          },
          (payload) => {
            console.log('Conversations change detected:', payload);
            fetchConversations();
          }
        )
        .subscribe((status) => {
          console.log('Conversations channel status:', status);
        });

      conversationsChannelRef.current = conversationsChannel;
    } catch (error) {
      console.error('Error setting up conversations channel:', error);
    }

    return cleanupChannels;
  }, [user?.id]);

  // Set up realtime subscriptions for messages
  useEffect(() => {
    if (!user) {
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
      return;
    }

    // Clean up existing messages channel
    if (messagesChannelRef.current) {
      supabase.removeChannel(messagesChannelRef.current);
      messagesChannelRef.current = null;
    }

    console.log('Setting up messages channel for user:', user.id);

    // Create messages channel
    const messagesChannelName = `messages-${user.id}-${Date.now()}`;
    
    try {
      const messagesChannel = supabase
        .channel(messagesChannelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          async (payload) => {
            console.log('New message detected:', payload);
            
            if (payload.new && typeof payload.new === 'object' && 'sender_id' in payload.new && 'recipient_id' in payload.new) {
              const newMessage = payload.new as any;
              
              // Check if this message involves the current user
              if (newMessage.sender_id === user.id || newMessage.recipient_id === user.id) {
                console.log('Message involves current user, updating...');
                
                // If user is currently viewing a conversation, refresh messages
                if (selectedConversation) {
                  await fetchMessages(selectedConversation);
                }
                
                // Always refresh conversations to update last message
                await fetchConversations();
                
                // If this is a message TO the current user (not from), show a toast
                if (newMessage.recipient_id === user.id && newMessage.sender_id !== user.id) {
                  // Get sender profile for toast
                  const { data: senderProfile } = await supabase
                    .from('profiles')
                    .select('display_name, username')
                    .eq('id', newMessage.sender_id)
                    .single();
                  
                  const senderName = senderProfile?.display_name || senderProfile?.username || 'Someone';
                  
                  toast({
                    title: "New message",
                    description: `${senderName} sent you a message`
                  });
                }
              }
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            console.log('Message updated:', payload);
            
            if (payload.new && typeof payload.new === 'object' && 'sender_id' in payload.new && 'recipient_id' in payload.new) {
              const updatedMessage = payload.new as any;
              if (updatedMessage.sender_id === user.id || updatedMessage.recipient_id === user.id) {
                if (selectedConversation) {
                  fetchMessages(selectedConversation);
                }
                fetchConversations();
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('Messages channel status:', status);
        });

      messagesChannelRef.current = messagesChannel;
    } catch (error) {
      console.error('Error setting up messages channel:', error);
    }

    return () => {
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
    };
  }, [user?.id, selectedConversation]);

  // Handle selectedConversation changes
  useEffect(() => {
    if (selectedConversation && user) {
      console.log('Fetching messages for conversation:', selectedConversation);
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation, user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      console.log('Initial fetch for user:', user.id);
      fetchConversations();
    }
  }, [user]);

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
