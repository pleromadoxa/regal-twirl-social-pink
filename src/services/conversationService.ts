
import { supabase } from '@/integrations/supabase/client';
import type { Conversation, UserProfile } from '@/types/messages';

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  const { data: conversationData, error: conversationError } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (conversationError) {
    console.error("Error fetching conversations:", conversationError);
    throw conversationError;
  }

  if (!conversationData) return [];

  // Fetch profiles for all participants
  const participantIds = new Set<string>();
  conversationData.forEach(conv => {
    participantIds.add(conv.participant_1);
    participantIds.add(conv.participant_2);
  });

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .in('id', Array.from(participantIds));

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    throw profilesError;
  }

  const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

  return conversationData.map(conv => {
    const participant1Profile = profilesMap.get(conv.participant_1);
    const participant2Profile = profilesMap.get(conv.participant_2);
    const otherUser = conv.participant_1 === userId 
      ? participant2Profile 
      : participant1Profile;
    
    return {
      ...conv,
      participant_1_profile: participant1Profile || null,
      participant_2_profile: participant2Profile || null,
      other_user: otherUser || null,
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
