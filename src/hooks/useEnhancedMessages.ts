
import { useState, useEffect } from 'react';
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
  is_group: boolean;
  group_name: string | null;
  group_avatar_url: string | null;
  created_by: string | null;
  last_message_at: string;
  created_at: string;
  other_user?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  participants?: Array<{
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    is_admin: boolean;
  }>;
  last_message?: EnhancedMessage;
}

export const useEnhancedMessages = () => {
  const [conversations, setConversations] = useState<EnhancedConversation[]>([]);
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

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
          if (conv.is_group) {
            // Get group participants
            const { data: participantsData } = await supabase
              .from('conversation_participants')
              .select(`
                user_id,
                is_admin,
                profiles:user_id (
                  id,
                  username,
                  display_name,
                  avatar_url
                )
              `)
              .eq('conversation_id', conv.id);

            return {
              ...conv,
              participants: participantsData?.map(p => ({
                id: p.profiles.id,
                username: p.profiles.username,
                display_name: p.profiles.display_name,
                avatar_url: p.profiles.avatar_url,
                is_admin: p.is_admin
              })) || []
            };
          } else {
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
          }
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
      const { data: messagesData, error } = await supabase
        .rpc('get_conversation_messages', { conv_id: conversationId });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(messagesData || []);
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

      let recipientId: string;
      
      if (conversation.is_group) {
        // For group messages, we'll use the conversation creator as recipient
        // This is a simplified approach - in a real app you might want different logic
        recipientId = conversation.created_by || conversation.participant_1;
      } else {
        recipientId = conversation.participant_1 === user.id 
          ? conversation.participant_2 
          : conversation.participant_1;
      }

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
      // Create the conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: participantIds[0] || user.id, // Fallback
          is_group: true,
          group_name: groupName,
          created_by: user.id
        })
        .select('id')
        .single();

      if (convError) {
        console.error('Error creating group conversation:', convError);
        return;
      }

      // Add all participants
      const participantsToInsert = [
        { conversation_id: newConv.id, user_id: user.id, is_admin: true },
        ...participantIds.map(id => ({ conversation_id: newConv.id, user_id: id, is_admin: false }))
      ];

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participantsToInsert);

      if (participantsError) {
        console.error('Error adding participants:', participantsError);
        return;
      }

      toast({
        title: "Group created",
        description: `Group "${groupName}" has been created successfully.`
      });

      fetchConversations();
      return newConv.id;
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error creating group",
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
        .eq('is_group', false)
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
          participant_2: recipientId,
          is_group: false
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

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const conversationsChannel = supabase
      .channel('conversations-changes')
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
      .channel('messages-changes')
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

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
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
