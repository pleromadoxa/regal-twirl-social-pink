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
    
    // Call the PostgreSQL function directly via SQL
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        streak_count,
        last_activity_date,
        participant_1,
        participant_2
      `)
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
    const lastActivityDate = data.last_activity_date || today;

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

    // Update conversation
    await supabase
      .from('conversations')
      .update({
        streak_count: newStreak,
        last_activity_date: hasActivityToday ? today : lastActivityDate,
        last_message_at: hasActivityToday ? new Date().toISOString() : undefined
      })
      .eq('id', conversationId);

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
      .select(`
        id,
        streak_count,
        last_activity_date,
        participant_1,
        participant_2
      `)
      .gt('streak_count', 0)
      .lt('last_activity_date', today)
      .gte('last_activity_date', yesterday);

    if (error) {
      console.error('[EnhancedStreak] Error fetching conversations for warnings:', error);
      return;
    }

    if (!conversations || conversations.length === 0) {
      console.log('[EnhancedStreak] No conversations need streak warnings');
      return;
    }

    const warningTime = new Date();
    warningTime.setHours(23, 0, 0, 0); // 23:00 today

    for (const conv of conversations) {
      // Schedule warning for both participants
      const warningData = [
        {
          conversation_id: conv.id,
          user_id: conv.participant_1,
          notification_type: 'streak_warning',
          streak_count: conv.streak_count,
          scheduled_for: warningTime.toISOString()
        },
        {
          conversation_id: conv.id,
          user_id: conv.participant_2,
          notification_type: 'streak_warning',
          streak_count: conv.streak_count,
          scheduled_for: warningTime.toISOString()
        }
      ];

      await supabase
        .from('streak_notifications')
        .upsert(warningData, { 
          onConflict: 'conversation_id,user_id,notification_type,scheduled_for',
          ignoreDuplicates: true 
        });
    }

    console.log('[EnhancedStreak] Scheduled warnings for', conversations.length, 'conversations');
  } catch (error) {
    console.error('[EnhancedStreak] Error scheduling streak warnings:', error);
  }
};

export const processStreakNotifications = async (): Promise<void> => {
  try {
    console.log('[EnhancedStreak] Processing streak notifications');
    
    // Get pending notifications
    const { data: notifications, error } = await supabase
      .from('streak_notifications')
      .select(`
        *,
        conversations!inner(participant_1, participant_2)
      `)
      .lte('scheduled_for', new Date().toISOString())
      .is('sent_at', null);

    if (error) {
      console.error('[EnhancedStreak] Error fetching notifications:', error);
      return;
    }

    if (!notifications || notifications.length === 0) {
      console.log('[EnhancedStreak] No pending notifications to process');
      return;
    }

    for (const notif of notifications) {
      try {
        // Determine the other user
        const otherUserId = notif.user_id === notif.conversations.participant_1 
          ? notif.conversations.participant_2 
          : notif.conversations.participant_1;

        // Get other user's profile
        const { data: otherUser } = await supabase
          .from('profiles')
          .select('display_name, username')
          .eq('id', otherUserId)
          .single();

        const otherUserName = otherUser?.display_name || otherUser?.username || 'Unknown User';

        // Create notification message
        let message = '';
        if (notif.notification_type === 'streak_warning') {
          message = `Your ${notif.streak_count}-day streak with ${otherUserName} is at risk! Send a message to keep it going.`;
        } else if (notif.notification_type === 'streak_lost') {
          message = `You lost your ${notif.streak_count}-day streak with ${otherUserName}. Start chatting again to begin a new streak!`;
        }

        // Create notification (assuming notifications table exists)
        await supabase
          .from('notifications')
          .insert({
            user_id: notif.user_id,
            type: notif.notification_type,
            actor_id: otherUserId,
            message: message,
            data: {
              conversation_id: notif.conversation_id,
              streak_count: notif.streak_count
            }
          });

        // Mark as sent
        await supabase
          .from('streak_notifications')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', notif.id);

        console.log('[EnhancedStreak] Processed notification for user:', notif.user_id);
      } catch (error) {
        console.error('[EnhancedStreak] Error processing individual notification:', error);
      }
    }
  } catch (error) {
    console.error('[EnhancedStreak] Error processing streak notifications:', error);
  }
};
