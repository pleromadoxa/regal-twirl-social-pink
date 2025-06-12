
import { supabase } from '@/integrations/supabase/client';
import type { Conversation } from '@/types/messages';

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  const { data: conversationsData, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participant_1_profile:profiles!participant_1(id, username, display_name, avatar_url),
      participant_2_profile:profiles!participant_2(id, username, display_name, avatar_url)
    `)
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }

  if (!conversationsData) return [];

  // Add updated_at field and determine other_user
  return conversationsData.map(conv => ({
    ...conv,
    updated_at: conv.last_message_at || conv.created_at,
    other_user: conv.participant_1 === userId 
      ? conv.participant_2_profile 
      : conv.participant_1_profile
  }));
};

export const findExistingConversation = async (userId1: string, userId2: string) => {
  const { data } = await supabase
    .from('conversations')
    .select('*')
    .or(`and(participant_1.eq.${userId1},participant_2.eq.${userId2}),and(participant_1.eq.${userId2},participant_2.eq.${userId1})`)
    .single();
  
  return data;
};

export const createConversation = async (userId1: string, userId2: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      participant_1: userId1,
      participant_2: userId2
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }

  return data;
};

export const updateConversationLastMessage = async (conversationId: string) => {
  const { error } = await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (error) {
    console.error('Error updating conversation last message:', error);
    throw error;
  }
};
