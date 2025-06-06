
import { supabase } from '@/integrations/supabase/client';
import type { Conversation, UserProfile } from '@/types/messages';

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  const { data: conversationData, error: conversationError } = await supabase
    .from('conversations')
    .select(`
      *,
      participant_1_profile:profiles!participant_1(id, username, display_name, avatar_url),
      participant_2_profile:profiles!participant_2(id, username, display_name, avatar_url)
    `)
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (conversationError) {
    console.error("Error fetching conversations:", conversationError);
    throw conversationError;
  }

  if (!conversationData) return [];

  return conversationData.map(conv => {
    const otherUser = conv.participant_1 === userId 
      ? conv.participant_2_profile 
      : conv.participant_1_profile;
    
    return {
      ...conv,
      other_user: otherUser,
      last_message: null,
      streak_count: 0
    };
  });
};

export const createConversation = async (participant1Id: string, participant2Id: string) => {
  const { data: newConversation, error } = await supabase
    .from('conversations')
    .insert({
      participant_1: participant1Id,
      participant_2: participant2Id
    })
    .select()
    .single();

  if (error) throw error;
  return newConversation;
};

export const findExistingConversation = async (userId: string, otherUserId: string) => {
  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('*')
    .or(`and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`)
    .maybeSingle();

  return existingConversation;
};

export const updateConversationLastMessage = async (conversationId: string) => {
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);
};
