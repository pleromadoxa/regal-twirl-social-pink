
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '@/types/messages';

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    console.log('Fetching conversations for user:', userId);
    
    // First get conversations
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      throw conversationsError;
    }

    if (!conversationsData || conversationsData.length === 0) {
      console.log('No conversations found');
      return [];
    }

    // Get all unique user IDs from conversations
    const userIds = new Set<string>();
    conversationsData.forEach(conv => {
      userIds.add(conv.participant_1);
      userIds.add(conv.participant_2);
    });

    // Fetch profiles for all users
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', Array.from(userIds));

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      // Continue without profiles rather than failing completely
    }

    // Get last messages for each conversation
    const { data: messagesData } = await supabase
      .from('messages')
      .select('id, content, created_at, sender_id, recipient_id')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    // Map profiles to conversations and add last messages
    const enrichedConversations: Conversation[] = conversationsData.map(conv => {
      const participant1Profile = profilesData?.find(p => p.id === conv.participant_1);
      const participant2Profile = profilesData?.find(p => p.id === conv.participant_2);
      
      // Find the last message for this conversation
      const conversationMessages = messagesData?.filter(msg => 
        (msg.sender_id === conv.participant_1 && msg.recipient_id === conv.participant_2) ||
        (msg.sender_id === conv.participant_2 && msg.recipient_id === conv.participant_1)
      ) || [];
      
      const lastMessage = conversationMessages[0]?.content || '';

      return {
        ...conv,
        participant_1_profile: participant1Profile || undefined,
        participant_2_profile: participant2Profile || undefined,
        last_message: lastMessage
      };
    });

    console.log('Successfully fetched conversations:', enrichedConversations.length);
    return enrichedConversations;
  } catch (error) {
    console.error('Error in fetchConversations:', error);
    return [];
  }
};

export const findExistingConversation = async (user1Id: string, user2Id: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant_1.eq.${user1Id},participant_2.eq.${user2Id}),and(participant_1.eq.${user2Id},participant_2.eq.${user1Id})`)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error finding conversation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in findExistingConversation:', error);
    return null;
  }
};

export const createConversation = async (participant1: string, participant2: string) => {
  try {
    console.log('Creating conversation between:', participant1, 'and', participant2);
    
    // Check if conversation already exists
    const existingConv = await findExistingConversation(participant1, participant2);

    if (existingConv) {
      console.log('Conversation already exists:', existingConv.id);
      return existingConv;
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        participant_1: participant1,
        participant_2: participant2,
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }

    console.log('Successfully created conversation:', newConv.id);
    return newConv;
  } catch (error) {
    console.error('Error in createConversation:', error);
    throw error;
  }
};
