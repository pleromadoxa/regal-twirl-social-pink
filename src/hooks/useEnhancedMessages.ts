import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchConversations, createConversation } from '@/services/conversationService';
import { fetchUserGroupConversations, createGroupConversation, type GroupConversation } from '@/services/groupConversationService';
import type { Conversation, Message } from '@/types/messages';

export const useEnhancedMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groupConversations, setGroupConversations] = useState<GroupConversation[]>([]);
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
      
      // Fetch both direct conversations and group conversations
      const [conversationsData, groupConversationsData] = await Promise.all([
        fetchConversations(user.id),
        fetchUserGroupConversations(user.id)
      ]);
      
      console.log('Fetched direct conversations:', conversationsData?.length || 0);
      console.log('Fetched group conversations:', groupConversationsData?.length || 0);
      console.log('Group conversations details:', groupConversationsData);
      
      setConversations(conversationsData);
      setGroupConversations(groupConversationsData);
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

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscriptions for user:', user.id);
    
    // Use unique channel name with user ID to prevent conflicts
    const channelName = `conversations-changes-${user.id}`;
    const conversationsChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          console.log('Conversation change detected, refetching...');
          fetchConversationsData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_conversations'
        },
        () => {
          console.log('Group conversation change detected, refetching...');
          fetchConversationsData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_conversation_members',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Group membership change detected, refetching...');
          fetchConversationsData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`
        },
        () => {
          console.log('Message change detected, refetching...');
          if (selectedConversation) {
            fetchMessages(selectedConversation);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_messages'
        },
        (payload) => {
          console.log('Group message change detected:', payload);
          if (selectedConversation) {
            fetchMessages(selectedConversation);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions for user:', user.id);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user?.id]); // Removed selectedConversation to prevent multiple subscriptions

  const fetchMessages = async (conversationId: string) => {
    if (!user || !conversationId) return;

    try {
      // Check if it's a group conversation
      const groupConv = groupConversations.find(g => g.id === conversationId);
      
      if (groupConv) {
        // Fetch group messages
        const { data: messagesData, error } = await supabase
          .from('group_messages')
          .select('*')
          .eq('group_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching group messages:', error);
          return;
        }

        // Fetch sender profiles separately
        const senderIds = [...new Set(messagesData?.map(m => m.sender_id) || [])];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', senderIds);

        const transformedMessages: Message[] = (messagesData || []).map(msg => {
          const senderProfile = profiles?.find(p => p.id === msg.sender_id);
          return {
            id: msg.id,
            content: msg.content,
            sender_id: msg.sender_id,
            recipient_id: '', // Group messages don't have recipients
            created_at: msg.created_at,
            read_at: null,
            edited_at: msg.edited_at,
            message_type: (msg.message_type as 'text' | 'image' | 'video' | 'audio' | 'document' | 'location') || 'text',
            metadata: {},
            sender_profile: senderProfile
          };
        });

        setMessages(transformedMessages);
      } else {
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

        const transformedMessages: Message[] = (messagesData || []).map(msg => {
          const senderProfile = profiles?.find(p => p.id === msg.sender_id);
          return {
            ...msg,
            message_type: (msg.message_type as 'text' | 'image' | 'video' | 'audio' | 'document' | 'location') || 'text',
            sender_profile: senderProfile
          };
        });

        setMessages(transformedMessages);
      }
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

  const createGroupConversationHandler = async (userIds: string[], groupName: string) => {
    if (!user) return;
    
    try {
      const newGroup = await createGroupConversation(
        groupName,
        `Group created by ${user.email}`,
        user.id,
        userIds
      );
      
      await fetchConversationsData();
      setSelectedConversation(newGroup.id);
      
      toast({
        title: "Group created",
        description: `${groupName} has been created successfully.`
      });
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error creating group",
        description: "Please try again later.",
        variant: "destructive"
      });
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
    groupConversations,
    messages,
    loading,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    markAsRead,
    refetch: fetchConversationsData,
    startDirectConversation,
    createGroupConversation: createGroupConversationHandler
  };
};
