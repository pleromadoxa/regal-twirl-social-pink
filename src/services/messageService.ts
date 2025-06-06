
import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/types/messages';
import { updateConversationStreak } from './streakService';

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
    sender_profile: profilesMap.get(msg.sender_id) || null
  }));
};

export const sendMessage = async (senderId: string, recipientId: string, content: string): Promise<Message> => {
  const { data: newMessage, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      content: content
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
    // Update streak count for this conversation
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
    sender_profile: senderProfile || null
  };
};

export const markMessageAsRead = async (messageId: string) => {
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId);
};

// Real-time subscription for messages
export const subscribeToMessages = (
  conversationId: string,
  userId: string,
  otherUserId: string,
  onNewMessage: (message: Message) => void
) => {
  const channel = supabase
    .channel(`messages-${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `or(and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId}))`
    }, async (payload) => {
      console.log('Real-time message received:', payload);
      
      // Fetch sender profile for the new message
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', payload.new.sender_id)
        .single();

      const messageWithProfile = {
        ...payload.new,
        sender_profile: senderProfile || null
      } as Message;

      onNewMessage(messageWithProfile);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
};

// Subscribe to typing indicators
export const subscribeToTyping = (
  conversationId: string,
  userId: string,
  onTypingUpdate: (isTyping: boolean, userId: string) => void
) => {
  const channel = supabase
    .channel(`typing-${conversationId}`)
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Typing state updated:', state);
      
      Object.keys(state).forEach(key => {
        const presence = state[key][0];
        if (presence.user_id !== userId) {
          onTypingUpdate(presence.typing, presence.user_id);
        }
      });
    })
    .subscribe();

  const sendTypingIndicator = async (isTyping: boolean) => {
    await channel.track({
      user_id: userId,
      typing: isTyping,
      online_at: new Date().toISOString()
    });
  };

  return {
    unsubscribe: () => supabase.removeChannel(channel),
    sendTypingIndicator
  };
};
