
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedStreakData {
  conversationId: string;
  currentStreak: number;
  streakStatus: 'active' | 'at_risk' | 'lost' | 'not_found';
  lastActivityDate: string | null;
}

export const checkAndUpdateStreak = async (conversationId: string): Promise<EnhancedStreakData> => {
  try {
    console.log('Checking and updating streak for conversation:', conversationId);
    
    const { data, error } = await supabase.rpc('check_and_update_streak', {
      conv_id: conversationId
    });

    if (error) {
      console.error('Error checking streak:', error);
      return {
        conversationId,
        currentStreak: 0,
        streakStatus: 'not_found',
        lastActivityDate: null
      };
    }

    const result = data?.[0];
    if (!result) {
      return {
        conversationId,
        currentStreak: 0,
        streakStatus: 'not_found',
        lastActivityDate: null
      };
    }

    console.log('Streak check result:', result);

    return {
      conversationId,
      currentStreak: result.current_streak || 0,
      streakStatus: result.streak_status || 'not_found',
      lastActivityDate: result.last_activity
    };
  } catch (error) {
    console.error('Error in checkAndUpdateStreak:', error);
    return {
      conversationId,
      currentStreak: 0,
      streakStatus: 'not_found',
      lastActivityDate: null
    };
  }
};

export const scheduleStreakWarnings = async (): Promise<void> => {
  try {
    console.log('Scheduling streak warnings...');
    
    const { error } = await supabase.rpc('schedule_streak_warnings');
    
    if (error) {
      console.error('Error scheduling streak warnings:', error);
    } else {
      console.log('Streak warnings scheduled successfully');
    }
  } catch (error) {
    console.error('Error in scheduleStreakWarnings:', error);
  }
};

export const processStreakNotifications = async (): Promise<void> => {
  try {
    console.log('Processing streak notifications...');
    
    const { error } = await supabase.rpc('process_streak_notifications');
    
    if (error) {
      console.error('Error processing streak notifications:', error);
    } else {
      console.log('Streak notifications processed successfully');
    }
  } catch (error) {
    console.error('Error in processStreakNotifications:', error);
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

export const getStreakStatusMessage = (status: string, streakCount: number): string => {
  switch (status) {
    case 'active':
      return `${streakCount}-day streak active! Keep it going! 🔥`;
    case 'at_risk':
      return `${streakCount}-day streak at risk! Send a message today to keep it alive! ⚠️`;
    case 'lost':
      return 'Streak lost. Start chatting to begin a new streak! 💔';
    default:
      return 'No active streak';
  }
};
