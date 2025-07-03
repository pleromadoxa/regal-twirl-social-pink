
import { supabase } from '@/integrations/supabase/client';
import { checkAndUpdateStreak, scheduleStreakWarnings } from './enhancedStreakService';

export interface StreakData {
  conversationId: string;
  currentStreak: number;
  lastMessageDate: string;
  longestStreak: number;
}

export const calculateStreak = async (conversationId: string): Promise<number> => {
  try {
    console.log('Calculating streak for conversation:', conversationId);
    
    const streakData = await checkAndUpdateStreak(conversationId);
    return streakData.currentStreak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
};

export const updateConversationStreak = async (conversationId: string): Promise<void> => {
  try {
    // Use the enhanced streak checking function
    const streakData = await checkAndUpdateStreak(conversationId);
    
    console.log('Updated conversation streak:', streakData);
    
    // Schedule warnings if needed
    await scheduleStreakWarnings();
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
