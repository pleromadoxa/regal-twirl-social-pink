
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
  is_private: boolean;
  max_members: number;
  invite_code: string | null;
  settings: any;
  members: Array<{
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    role: string;
    joined_at: string;
  }>;
  last_message?: {
    content: string;
    sender_name: string;
    created_at: string;
  };
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  reply_to_id: string | null;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  reply_to?: GroupMessage;
}

export const fetchUserGroupConversations = async (userId: string): Promise<GroupConversation[]> => {
  try {
    console.log('Fetching group conversations for user:', userId);

    // Get groups where the user is a member
    const { data: membershipData, error: membershipError } = await supabase
      .from('group_conversation_members')
      .select('group_id')
      .eq('user_id', userId);

    if (membershipError) {
      console.error('Error fetching user memberships:', membershipError);
      throw membershipError;
    }

    if (!membershipData || membershipData.length === 0) {
      console.log('No group memberships found');
      return [];
    }

    const groupIds = membershipData.map(m => m.group_id);

    // Get group conversations
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
        last_message_at,
        is_private,
        max_members,
        invite_code,
        settings
      `)
      .in('id', groupIds)
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

    // For each group, fetch the members and last message
    const enrichedGroups = await Promise.all(
      groupsData.map(async (group) => {
        try {
          // Get members for this group
          const { data: membersData, error: membersError } = await supabase
            .from('group_conversation_members')
            .select(`
              user_id,
              role,
              joined_at,
              profiles!inner(
                id,
                username,
                display_name,
                avatar_url
              )
            `)
            .eq('group_id', group.id);

          if (membersError) {
            console.error('Error fetching group members:', membersError);
          }

          // Get last message
          const { data: lastMessageData } = await supabase
            .from('group_messages')
            .select(`
              content,
              created_at,
              profiles!inner(
                display_name,
                username
              )
            `)
            .eq('group_id', group.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const memberProfiles = (membersData || []).map((member: any) => ({
            id: member.profiles.id,
            username: member.profiles.username || 'unknown',
            display_name: member.profiles.display_name || member.profiles.username || 'Unknown User',
            avatar_url: member.profiles.avatar_url || '',
            role: member.role,
            joined_at: member.joined_at
          }));

          return {
            ...group,
            member_count: memberProfiles.length,
            members: memberProfiles,
            last_message: lastMessageData ? {
              content: lastMessageData.content,
              sender_name: lastMessageData.profiles.display_name || lastMessageData.profiles.username,
              created_at: lastMessageData.created_at
            } : undefined
          };
        } catch (error) {
          console.error('Error processing group:', group.id, error);
          return {
            ...group,
            member_count: 0,
            members: [],
            last_message: undefined
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
  memberIds: string[],
  isPrivate: boolean = false,
  maxMembers: number = 50
): Promise<GroupConversation> => {
  try {
    console.log('Creating group conversation:', { name, description, createdBy, memberIds, isPrivate, maxMembers });
    
    // Generate invite code
    const { data: inviteCodeData } = await supabase.rpc('generate_invite_code');
    const inviteCode = inviteCodeData || Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create the group conversation
    const { data: groupData, error: groupError } = await supabase
      .from('group_conversations')
      .insert({
        name,
        description,
        created_by: createdBy,
        is_private: isPrivate,
        max_members: maxMembers,
        invite_code: inviteCode,
        settings: {
          allow_member_invite: true,
          message_deletion: 'admin_only',
          file_sharing: true
        }
      })
      .select()
      .single();

    if (groupError) {
      console.error('Error creating group conversation:', groupError);
      throw groupError;
    }

    console.log('Created group:', groupData);

    // Add creator as admin and other members
    const membersToAdd = [
      { group_id: groupData.id, user_id: createdBy, role: 'admin' },
      ...memberIds.filter(id => id !== createdBy).map(userId => ({ 
        group_id: groupData.id, 
        user_id: userId, 
        role: 'member' 
      }))
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

export const joinGroupByInviteCode = async (
  inviteCode: string,
  userId: string
): Promise<GroupConversation | null> => {
  try {
    // Find group by invite code
    const { data: groupData, error: groupError } = await supabase
      .from('group_conversations')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (groupError || !groupData) {
      throw new Error('Invalid invite code');
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('group_conversation_members')
      .select('id')
      .eq('group_id', groupData.id)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      throw new Error('Already a member of this group');
    }

    // Check member limit
    const { count: memberCount } = await supabase
      .from('group_conversation_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupData.id);

    if (memberCount && memberCount >= groupData.max_members) {
      throw new Error('Group is full');
    }

    // Add user to group
    const { error: joinError } = await supabase
      .from('group_conversation_members')
      .insert({
        group_id: groupData.id,
        user_id: userId,
        role: 'member'
      });

    if (joinError) {
      throw joinError;
    }

    // Return updated group data
    const groups = await fetchUserGroupConversations(userId);
    return groups.find(g => g.id === groupData.id) || null;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

export const fetchGroupMessages = async (
  groupId: string,
  limit: number = 50,
  offset: number = 0
): Promise<GroupMessage[]> => {
  try {
    const { data: messagesData, error } = await supabase
      .from('group_messages')
      .select(`
        id,
        group_id,
        sender_id,
        content,
        message_type,
        reply_to_id,
        edited_at,
        created_at,
        updated_at,
        profiles!inner(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Process messages and handle replies
    const messages = await Promise.all(
      (messagesData || []).map(async (msg: any) => {
        let replyTo = undefined;
        
        if (msg.reply_to_id) {
          const { data: replyData } = await supabase
            .from('group_messages')
            .select(`
              id,
              content,
              created_at,
              profiles!inner(display_name, username)
            `)
            .eq('id', msg.reply_to_id)
            .single();
          
          if (replyData) {
            replyTo = {
              id: replyData.id,
              content: replyData.content,
              created_at: replyData.created_at,
              sender_name: replyData.profiles.display_name || replyData.profiles.username
            };
          }
        }

        return {
          id: msg.id,
          group_id: msg.group_id,
          sender_id: msg.sender_id,
          content: msg.content,
          message_type: msg.message_type,
          reply_to_id: msg.reply_to_id,
          edited_at: msg.edited_at,
          created_at: msg.created_at,
          updated_at: msg.updated_at,
          sender: {
            id: msg.profiles.id,
            username: msg.profiles.username,
            display_name: msg.profiles.display_name || msg.profiles.username,
            avatar_url: msg.profiles.avatar_url || ''
          },
          reply_to: replyTo
        };
      })
    );

    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Error fetching group messages:', error);
    return [];
  }
};

export const sendGroupMessage = async (
  groupId: string,
  senderId: string,
  content: string,
  messageType: string = 'text',
  replyToId?: string
): Promise<GroupMessage> => {
  try {
    const { data: messageData, error } = await supabase
      .from('group_messages')
      .insert({
        group_id: groupId,
        sender_id: senderId,
        content,
        message_type: messageType,
        reply_to_id: replyToId || null
      })
      .select(`
        *,
        profiles!inner(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    // Update group's last_message_at
    await supabase
      .from('group_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', groupId);

    return {
      id: messageData.id,
      group_id: messageData.group_id,
      sender_id: messageData.sender_id,
      content: messageData.content,
      message_type: messageData.message_type,
      reply_to_id: messageData.reply_to_id,
      edited_at: messageData.edited_at,
      created_at: messageData.created_at,
      updated_at: messageData.updated_at,
      sender: {
        id: messageData.profiles.id,
        username: messageData.profiles.username,
        display_name: messageData.profiles.display_name || messageData.profiles.username,
        avatar_url: messageData.profiles.avatar_url || ''
      }
    };
  } catch (error) {
    console.error('Error sending group message:', error);
    throw error;
  }
};

export const leaveGroup = async (groupId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('group_conversation_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

export const updateGroupSettings = async (
  groupId: string,
  settings: any
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('group_conversations')
      .update({ settings })
      .eq('id', groupId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating group settings:', error);
    throw error;
  }
};
