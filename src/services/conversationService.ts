
import { supabase } from '@/integrations/supabase/client';
import type { Conversation } from '@/types/messages';

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  console.log('Fetching conversations for user:', userId);
  
  const { data: conversationsData, error: conversationsError } = await supabase
    .from('conversations')
    .select(`
      *,
      participant_1_profile:profiles!conversations_participant_1_fkey(
        id, username, display_name, avatar_url
      ),
      participant_2_profile:profiles!conversations_participant_2_fkey(
        id, username, display_name, avatar_url
      )
    `)
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (conversationsError) {
    console.error("Error fetching conversations:", conversationsError);
    throw conversationsError;
  }

  console.log('Raw conversations data:', conversationsData);

  return (conversationsData || []).map(conv => ({
    ...conv,
    participant_1_profile: Array.isArray(conv.participant_1_profile) 
      ? conv.participant_1_profile[0] 
      : conv.participant_1_profile,
    participant_2_profile: Array.isArray(conv.participant_2_profile) 
      ? conv.participant_2_profile[0] 
      : conv.participant_2_profile
  }));
};

export const createConversation = async (participant1: string, participant2: string): Promise<Conversation> => {
  console.log('Creating conversation between:', participant1, 'and', participant2);
  
  // First check if conversation already exists
  const existing = await findExistingConversation(participant1, participant2);
  if (existing) {
    console.log('Found existing conversation:', existing.id);
    return existing;
  }

  const { data: newConversation, error } = await supabase
    .from('conversations')
    .insert({
      participant_1: participant1,
      participant_2: participant2,
      last_message_at: new Date().toISOString()
    })
    .select(`
      *,
      participant_1_profile:profiles!conversations_participant_1_fkey(
        id, username, display_name, avatar_url
      ),
      participant_2_profile:profiles!conversations_participant_2_fkey(
        id, username, display_name, avatar_url
      )
    `)
    .single();

  if (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }

  console.log('Created new conversation:', newConversation);

  return {
    ...newConversation,
    participant_1_profile: Array.isArray(newConversation.participant_1_profile) 
      ? newConversation.participant_1_profile[0] 
      : newConversation.participant_1_profile,
    participant_2_profile: Array.isArray(newConversation.participant_2_profile) 
      ? newConversation.participant_2_profile[0] 
      : newConversation.participant_2_profile
  };
};

export const findExistingConversation = async (user1: string, user2: string): Promise<Conversation | null> => {
  console.log('Looking for existing conversation between:', user1, 'and', user2);
  
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participant_1_profile:profiles!conversations_participant_1_fkey(
        id, username, display_name, avatar_url
      ),
      participant_2_profile:profiles!conversations_participant_2_fkey(
        id, username, display_name, avatar_url
      )
    `)
    .or(`and(participant_1.eq.${user1},participant_2.eq.${user2}),and(participant_1.eq.${user2},participant_2.eq.${user1})`)
    .maybeSingle();

  if (error) {
    console.error("Error finding existing conversation:", error);
    return null;
  }

  if (!data) {
    console.log('No existing conversation found');
    return null;
  }

  console.log('Found existing conversation:', data.id);

  return {
    ...data,
    participant_1_profile: Array.isArray(data.participant_1_profile) 
      ? data.participant_1_profile[0] 
      : data.participant_1_profile,
    participant_2_profile: Array.isArray(data.participant_2_profile) 
      ? data.participant_2_profile[0] 
      : data.participant_2_profile
  };
};

export const updateConversationLastMessage = async (conversationId: string): Promise<void> => {
  const { error } = await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (error) {
    console.error("Error updating conversation last message time:", error);
    throw error;
  }
};
