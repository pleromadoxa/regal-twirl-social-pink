
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
    console.log('Fetching group conversations for user:', userId);

    // Get group conversations where the user is a member by fetching groups directly
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
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (groupsError) {
      console.error('Error fetching group conversations:', groupsError);
      throw groupsError;
    }

    if (!groupsData || groupsData.length === 0) {
      console.log('No group conversations found');
      return [];
    }

    console.log('Found', groupsData.length, 'group conversations');

    // For each group, fetch the members with their profiles
    const enrichedGroups = await Promise.all(
      groupsData.map(async (group) => {
        try {
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

          console.log('Found', membersData?.length || 0, 'members for group:', group.name);

          // Get profile info for each member
          const memberProfiles = await Promise.all(
            (membersData || []).map(async (member) => {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, username, display_name, avatar_url')
                .eq('id', member.user_id)
                .single();

              if (profileError || !profileData) {
                console.error('Error fetching profile for user:', member.user_id, profileError);
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
        } catch (error) {
          console.error('Error processing group:', group.id, error);
          return {
            ...group,
            member_count: 0,
            members: []
          };
        }
      })
    );

    console.log('Successfully enriched', enrichedGroups.length, 'groups');
    return enrichedGroups;
  } catch (error) {
    console.error('Error in fetchUserGroupConversations:', error);
    return [];
  }
};

export const createGroupConversation = async (
  name: string,
  description: string | null,
  createdBy: string,
  memberIds: string[]
): Promise<GroupConversation> => {
  try {
    console.log('Creating group conversation:', { name, description, createdBy, memberIds });
    
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

    console.log('Created group:', groupData);

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

    console.log('Added members to group');

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
