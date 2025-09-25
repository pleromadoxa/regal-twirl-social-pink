import { supabase } from '@/integrations/supabase/client';
import { subscriptionManager } from './subscriptionManager';

// Global cleanup function to prevent memory leaks
export const cleanupAllChannels = () => {
  console.log('[GlobalChannelCleanup] Cleaning up all channels');
  
  try {
    // Cleanup subscription manager
    subscriptionManager.cleanup();
    
    // Force cleanup any remaining channels that might not be tracked
    const supabaseClient = supabase as any;
    if (supabaseClient.realtime && supabaseClient.realtime.channels) {
      const channels = supabaseClient.realtime.channels;
      Object.keys(channels).forEach(channelName => {
        try {
          const channel = channels[channelName];
          if (channel && typeof channel.unsubscribe === 'function') {
            channel.unsubscribe();
          }
          supabase.removeChannel(channel);
        } catch (error) {
          console.warn(`[GlobalChannelCleanup] Error cleaning up channel ${channelName}:`, error);
        }
      });
    }
  } catch (error) {
    console.error('[GlobalChannelCleanup] Error during cleanup:', error);
  }
};

// Set up global cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupAllChannels);
  window.addEventListener('unload', cleanupAllChannels);
}