import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDisappearingMessages = () => {
  const setMessageExpiry = (duration: number): Date | null => {
    if (duration <= 0) return null;
    
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + duration);
    return expiryDate;
  };

  const cleanupExpiredMessages = async () => {
    try {
      const { error } = await supabase.rpc('delete_expired_messages');
      if (error) throw error;
    } catch (error) {
      console.error('Error cleaning up expired messages:', error);
    }
  };

  useEffect(() => {
    // Set up periodic cleanup every 5 minutes
    const cleanupInterval = setInterval(cleanupExpiredMessages, 5 * 60 * 1000);

    // Initial cleanup
    cleanupExpiredMessages();

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    setMessageExpiry,
    cleanupExpiredMessages
  };
};