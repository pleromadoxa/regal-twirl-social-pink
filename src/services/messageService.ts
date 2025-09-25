
import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/types/messages';
import { updateConversationStreak } from './streakService';
import { subscriptionManager } from '@/utils/subscriptionManager';

export const fetchMessages = async (userId: string, otherUserId: string): Promise<Message[]> => {
  const { data: messageData, error: messageError } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
    .order('created_at', { ascending: true });

  if (messageError) {
    console.error("Error fetching messages:", messageError);
    throw messageError;
  }

  if (!messageData) return [];

  // Fetch sender profiles
  const senderIds = [...new Set(messageData.map(msg => msg.sender_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .in('id', senderIds);

  if (profilesError) {
    console.error("Error fetching sender profiles:", profilesError);
    throw profilesError;
  }

  const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

  return messageData.map(msg => ({
    ...msg,
    conversation_id: '',
    message_type: (msg.message_type || 'text') as 'text' | 'image' | 'video' | 'audio' | 'document' | 'location',
    sender_profile: profilesMap.get(msg.sender_id) || null
  }));
};

export const sendMessage = async (
  senderId: string, 
  recipientId: string, 
  content: string,
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' = 'text',
  metadata: any = {}
): Promise<Message> => {
  const { data: newMessage, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      content: content,
      message_type: messageType,
      metadata: metadata
    })
    .select('*')
    .single();

  if (error) {
    console.error("Error sending message:", error);
    throw error;
  }

  // Find or create conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(participant_1.eq.${senderId},participant_2.eq.${recipientId}),and(participant_1.eq.${recipientId},participant_2.eq.${senderId})`)
    .single();

  if (conversation) {
    // Update streak count for this conversation using enhanced service
    await updateConversationStreak(conversation.id);
  }

  // Fetch sender profile separately
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .eq('id', senderId)
    .single();

  return {
    ...newMessage,
    conversation_id: conversation?.id || '',
    message_type: (newMessage.message_type || 'text') as 'text' | 'image' | 'video' | 'audio' | 'document' | 'location',
    sender_profile: senderProfile || null
  };
};

export const deleteMessage = async (messageId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)
    .eq('sender_id', userId);

  if (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId: string) => {
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId);
};

// Real-time subscription for messages using subscription manager
export const subscribeToMessages = (
  conversationId: string,
  userId: string,
  otherUserId: string,
  onNewMessage: (message: Message) => void
) => {
  const channelName = `messages-${conversationId}-${userId}-${otherUserId}`;
  
  return subscriptionManager.subscribe(channelName, {
    postgres_changes: {
      config: {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId}))`
      },
      callback: async (payload: any) => {
        console.log('Real-time message received:', payload);
        
        // Fetch sender profile for the new message
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .eq('id', payload.new.sender_id)
          .single();

        const messageWithProfile = {
          ...payload.new,
          conversation_id: conversationId,
          message_type: 'text' as const,
          sender_profile: senderProfile || null
        } as Message;

        onNewMessage(messageWithProfile);
      }
    }
  });
};

// Typing indicators need direct presence channels as they use track() method
export const subscribeToTyping = (
  conversationId: string,
  userId: string,
  onTypingUpdate: (isTyping: boolean, userId: string) => void
) => {
  const channelName = `typing-${conversationId}-${userId}-${Date.now()}`;
  
  const channel = supabase
    .channel(channelName)
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Typing state updated:', state);
      
      Object.keys(state).forEach(key => {
        const presenceList = state[key];
        if (presenceList && presenceList.length > 0) {
          const presence = presenceList[0] as any;
          if (presence.user_id !== userId) {
            onTypingUpdate(presence.typing || false, presence.user_id);
          }
        }
      });
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('Typing join:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('Typing leave:', key, leftPresences);
    });

  let subscribed = false;

  // Subscribe to the channel
  channel.subscribe((status) => {
    console.log('Typing channel subscription status:', status);
    if (status === 'SUBSCRIBED') {
      subscribed = true;
    }
  });

  const sendTypingIndicator = async (isTyping: boolean) => {
    if (subscribed) {
      await channel.track({
        user_id: userId,
        typing: isTyping,
        online_at: new Date().toISOString()
      });
    }
  };

  return {
    unsubscribe: () => {
      try {
        channel.unsubscribe();
        supabase.removeChannel(channel);
      } catch (error) {
        console.error('Error removing typing channel:', error);
      }
    },
    sendTypingIndicator
  };
};
