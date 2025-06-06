
import { supabase } from '@/integrations/supabase/client';

export interface StreakData {
  conversationId: string;
  currentStreak: number;
  lastMessageDate: string;
  longestStreak: number;
}

export const calculateStreak = async (conversationId: string): Promise<number> => {
  try {
    // Get all messages for this conversation, ordered by date
    const { data: messages, error } = await supabase
      .from('messages')
      .select('created_at, sender_id')
      .or(`recipient_id.eq.${conversationId.split('-')[0]},recipient_id.eq.${conversationId.split('-')[1]}`)
      .order('created_at', { ascending: false });

    if (error || !messages) {
      console.error('Error fetching messages for streak calculation:', error);
      return 0;
    }

    if (messages.length === 0) return 0;

    // Group messages by UTC date
    const messagesByDate = new Map<string, boolean>();
    messages.forEach(message => {
      const utcDate = new Date(message.created_at).toISOString().split('T')[0];
      messagesByDate.set(utcDate, true);
    });

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    
    // Check if there's activity today or yesterday (to account for different timezones)
    const todayUTC = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayUTC = yesterday.toISOString().split('T')[0];

    let checkDate = new Date(today);
    
    // Start from today if there's activity, otherwise from yesterday
    if (!messagesByDate.has(todayUTC)) {
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    }

    // Count consecutive days backwards
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (messagesByDate.has(dateStr)) {
        currentStreak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      } else {
        break;
      }
    }

    return currentStreak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
};

export const updateConversationStreak = async (conversationId: string): Promise<void> => {
  try {
    const streak = await calculateStreak(conversationId);
    
    await supabase
      .from('conversations')
      .update({ 
        streak_count: streak,
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId);
  } catch (error) {
    console.error('Error updating conversation streak:', error);
  }
};

export const getStreakEmoji = (streakCount: number): string => {
  if (streakCount === 0) return '';
  if (streakCount < 3) return '🔥';
  if (streakCount < 7) return '🔥🔥';
  if (streakCount < 14) return '🔥🔥🔥';
  if (streakCount < 30) return '🔥🔥🔥🔥';
  return '🔥🔥🔥🔥🔥';
};
