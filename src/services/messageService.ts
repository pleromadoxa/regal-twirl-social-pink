import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/types/messages';

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
