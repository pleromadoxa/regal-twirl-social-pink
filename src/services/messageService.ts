
import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/types/messages';

export const fetchMessages = async (userId: string, otherUserId: string): Promise<Message[]> => {
  const { data: messageData, error: messageError } = await supabase
    .from('messages')
    .select(`
      *,
      sender_profile:profiles!sender_id(id, username, display_name, avatar_url)
    `)
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
    .order('created_at', { ascending: true });

  if (messageError) {
    console.error("Error fetching messages:", messageError);
    throw messageError;
  }

  return messageData || [];
};

export const sendMessage = async (senderId: string, recipientId: string, content: string): Promise<Message> => {
  const { data: newMessage, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      content: content
    })
    .select(`
      *,
      sender_profile:profiles!sender_id(id, username, display_name, avatar_url)
    `)
    .single();

  if (error) {
    console.error("Error sending message:", error);
    throw error;
  }

  return newMessage;
};

export const markMessageAsRead = async (messageId: string) => {
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId);
};
