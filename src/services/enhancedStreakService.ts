import { supabase } from '@/integrations/supabase/client';

export interface StreakData {
  conversationId: string;
  currentStreak: number;
  streakStatus: string;
  lastActivityDate: string;
}

export const checkAndUpdateStreak = async (conversationId: string): Promise<StreakData> => {
  try {
    console.log('[EnhancedStreak] Checking streak for conversation:', conversationId);
    
    // Get conversation details
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('[EnhancedStreak] Error fetching conversation:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Conversation not found');
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Check for messages today and yesterday
    const { data: todayMessages } = await supabase
      .from('messages')
      .select('id')
      .or(`and(sender_id.eq.${data.participant_1},recipient_id.eq.${data.participant_2}),and(sender_id.eq.${data.participant_2},recipient_id.eq.${data.participant_1})`)
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`)
      .limit(1);

    const { data: yesterdayMessages } = await supabase
      .from('messages')
      .select('id')
      .or(`and(sender_id.eq.${data.participant_1},recipient_id.eq.${data.participant_2}),and(sender_id.eq.${data.participant_2},recipient_id.eq.${data.participant_1})`)
      .gte('created_at', `${yesterday}T00:00:00Z`)
      .lt('created_at', `${yesterday}T23:59:59Z`)
      .limit(1);

    const hasActivityToday = todayMessages && todayMessages.length > 0;
    const hasActivityYesterday = yesterdayMessages && yesterdayMessages.length > 0;
    
    let newStreak = 0;
    let status = 'active';
    
    // Use last_message_at as fallback for last_activity_date if the column doesn't exist yet
    const lastActivityDate = (data as any).last_activity_date || data.last_message_at?.split('T')[0] || today;

    if (hasActivityToday) {
      // Continue or start streak
      if (lastActivityDate === yesterday) {
        newStreak = (data.streak_count || 0) + 1;
      } else {
        newStreak = 1; // Reset to 1 if there was a gap
      }
      status = 'active';
    } else if (lastActivityDate < yesterday) {
      // Streak is broken
      newStreak = 0;
      status = 'lost';
    } else {
      // No activity today, keep current streak
      newStreak = data.streak_count || 0;
      status = 'at_risk';
    }

    // Update conversation with available fields
    const updateData: any = {
      streak_count: newStreak,
      last_message_at: hasActivityToday ? new Date().toISOString() : data.last_message_at
    };

    // Only add last_activity_date if it exists in the schema
    try {
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          ...updateData,
          last_activity_date: hasActivityToday ? today : lastActivityDate
        })
        .eq('id', conversationId);

      if (updateError && updateError.message.includes('last_activity_date')) {
        // Fallback to update without last_activity_date
        await supabase
          .from('conversations')
          .update(updateData)
          .eq('id', conversationId);
      }
    } catch (fallbackError) {
      // Fallback update without new columns
      await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId);
    }

    return {
      conversationId,
      currentStreak: newStreak,
      streakStatus: status,
      lastActivityDate: hasActivityToday ? today : lastActivityDate
    };
  } catch (error) {
    console.error('[EnhancedStreak] Error in checkAndUpdateStreak:', error);
    throw error;
  }
};

export const scheduleStreakWarnings = async (): Promise<void> => {
  try {
    console.log('[EnhancedStreak] Scheduling streak warnings');
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Find conversations with active streaks that need warnings
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .gt('streak_count', 0);

    if (error) {
      console.error('[EnhancedStreak] Error fetching conversations for warnings:', error);
      return;
    }

    if (!conversations || conversations.length === 0) {
      console.log('[EnhancedStreak] No conversations need streak warnings');
      return;
    }

    // Filter conversations that need warnings (basic client-side filtering)
    const conversationsNeedingWarnings = conversations.filter(conv => {
      const lastActivity = (conv as any).last_activity_date || conv.last_message_at?.split('T')[0] || today;
      return lastActivity < today && lastActivity >= yesterday;
    });

    console.log('[EnhancedStreak] Found conversations needing warnings:', conversationsNeedingWarnings.length);

    // For now, we'll create notifications directly in the notifications table
    // since streak_notifications table might not exist yet
    for (const conv of conversationsNeedingWarnings) {
      try {
        // Create warning notifications for both participants
        const warningMessage1 = `Your ${conv.streak_count}-day streak is at risk! Send a message to keep it going.`;
        const warningMessage2 = `Your ${conv.streak_count}-day streak is at risk! Send a message to keep it going.`;

        await supabase
          .from('notifications')
          .insert([
            {
              user_id: conv.participant_1,
              type: 'streak_warning',
              actor_id: conv.participant_2,
              message: warningMessage1,
              data: {
                conversation_id: conv.id,
                streak_count: conv.streak_count
              }
            },
            {
              user_id: conv.participant_2,
              type: 'streak_warning',
              actor_id: conv.participant_1,
              message: warningMessage2,
              data: {
                conversation_id: conv.id,
                streak_count: conv.streak_count
              }
            }
          ]);
      } catch (notifError) {
        console.error('[EnhancedStreak] Error creating notification:', notifError);
      }
    }

    console.log('[EnhancedStreak] Scheduled warnings for', conversationsNeedingWarnings.length, 'conversations');
  } catch (error) {
    console.error('[EnhancedStreak] Error scheduling streak warnings:', error);
  }
};

export const processStreakNotifications = async (): Promise<void> => {
  try {
    console.log('[EnhancedStreak] Processing streak notifications');
    
    // Get pending streak notifications from the notifications table
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .in('type', ['streak_warning', 'streak_lost'])
      .is('read', false);

    if (error) {
      console.error('[EnhancedStreak] Error fetching notifications:', error);
      return;
    }

    if (!notifications || notifications.length === 0) {
      console.log('[EnhancedStreak] No pending streak notifications to process');
      return;
    }

    console.log('[EnhancedStreak] Found', notifications.length, 'pending streak notifications');

    // For basic processing, we'll just mark them as processed
    // In a full implementation, you might want to send push notifications, emails, etc.
    for (const notification of notifications) {
      try {
        // Mark notification as read/processed
        await supabase
          .from('notifications')
          .update({ read: true, read_at: new Date().toISOString() })
          .eq('id', notification.id);

        console.log('[EnhancedStreak] Processed notification for user:', notification.user_id);
      } catch (error) {
        console.error('[EnhancedStreak] Error processing individual notification:', error);
      }
    }
  } catch (error) {
    console.error('[EnhancedStreak] Error processing streak notifications:', error);
  }
};
