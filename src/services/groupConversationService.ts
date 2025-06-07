
import { supabase } from '@/integrations/supabase/client';

export interface GroupConversation {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  member_count: number;
  members: Array<{
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    role: string;
  }>;
}

export const fetchUserGroupConversations = async (userId: string): Promise<GroupConversation[]> => {
  try {
    // First, get groups where the user is a member
    const { data: membershipData, error: membershipError } = await supabase
      .from('group_conversation_members')
      .select('group_id')
      .eq('user_id', userId);

    if (membershipError) {
      console.error('Error fetching user memberships:', membershipError);
      throw membershipError;
    }

    if (!membershipData || membershipData.length === 0) {
      return [];
    }

    const groupIds = membershipData.map(m => m.group_id);

    // Get group conversations the user is a member of
    const { data: groupsData, error: groupsError } = await supabase
      .from('group_conversations')
      .select(`
        id,
        name,
        description,
        avatar_url,
        created_by,
        created_at,
        updated_at,
        last_message_at
      `)
      .in('id', groupIds)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (groupsError) {
      console.error('Error fetching group conversations:', groupsError);
      throw groupsError;
    }

    if (!groupsData || groupsData.length === 0) {
      return [];
    }

    // For each group, fetch the members with their profiles
    const enrichedGroups = await Promise.all(
      groupsData.map(async (group) => {
        // Get members for this group
        const { data: membersData, error: membersError } = await supabase
          .from('group_conversation_members')
          .select('user_id, role')
          .eq('group_id', group.id);

        if (membersError) {
          console.error('Error fetching group members:', membersError);
          return {
            ...group,
            member_count: 0,
            members: []
          };
        }

        // Get profile info for each member
        const memberProfiles = await Promise.all(
          (membersData || []).map(async (member) => {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id, username, display_name, avatar_url')
              .eq('id', member.user_id)
              .single();

            if (profileError || !profileData) {
              return {
                id: member.user_id,
                username: 'unknown',
                display_name: 'Unknown User',
                avatar_url: '',
                role: member.role
              };
            }

            return {
              id: profileData.id,
              username: profileData.username || 'unknown',
              display_name: profileData.display_name || profileData.username || 'Unknown User',
              avatar_url: profileData.avatar_url || '',
              role: member.role
            };
          })
        );

        return {
          ...group,
          member_count: memberProfiles.length,
          members: memberProfiles
        };
      })
    );

    return enrichedGroups;
  } catch (error) {
    console.error('Error in fetchUserGroupConversations:', error);
    throw error;
  }
};

export const createGroupConversation = async (
  name: string,
  description: string | null,
  createdBy: string,
  memberIds: string[]
): Promise<GroupConversation> => {
  try {
    // Create the group conversation
    const { data: groupData, error: groupError } = await supabase
      .from('group_conversations')
      .insert({
        name,
        description,
        created_by: createdBy
      })
      .select()
      .single();

    if (groupError) {
      console.error('Error creating group conversation:', groupError);
      throw groupError;
    }

    // Add creator as admin
    const membersToAdd = [
      { group_id: groupData.id, user_id: createdBy, role: 'admin' },
      ...memberIds.map(userId => ({ group_id: groupData.id, user_id: userId, role: 'member' }))
    ];

    const { error: membersError } = await supabase
      .from('group_conversation_members')
      .insert(membersToAdd);

    if (membersError) {
      console.error('Error adding group members:', membersError);
      throw membersError;
    }

    // Fetch the complete group data
    const groups = await fetchUserGroupConversations(createdBy);
    const createdGroup = groups.find(g => g.id === groupData.id);
    
    if (!createdGroup) {
      throw new Error('Failed to fetch created group');
    }

    return createdGroup;
  } catch (error) {
    console.error('Error in createGroupConversation:', error);
    throw error;
  }
};
