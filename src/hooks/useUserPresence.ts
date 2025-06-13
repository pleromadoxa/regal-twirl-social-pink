
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen: string;
  updated_at: string;
}

export const useUserPresence = () => {
  const [presenceData, setPresenceData] = useState<Record<string, UserPresence>>({});
  const { user } = useAuth();
  const heartbeatRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<any>();
  const isSubscribedRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Update user's own presence
  const updatePresence = async (isOnline: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('update_user_presence', {
        user_id: user.id,
        is_online: isOnline
      });

      if (error) {
        console.error('Error updating presence:', error);
      }
    } catch (error) {
      console.error('Error in updatePresence:', error);
    }
  };

  // Fetch presence data for multiple users
  const fetchPresenceData = async (userIds: string[]) => {
    if (userIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('*')
        .in('user_id', userIds);

      if (error) {
        console.error('Error fetching presence data:', error);
        return;
      }

      const presenceMap = data.reduce((acc, presence) => {
        acc[presence.user_id] = presence;
        return acc;
      }, {} as Record<string, UserPresence>);

      setPresenceData(prev => ({ ...prev, ...presenceMap }));
    } catch (error) {
      console.error('Error in fetchPresenceData:', error);
    }
  };

  // Get user's online status
  const getUserStatus = (userId: string) => {
    const presence = presenceData[userId];
    if (!presence) return { isOnline: false, lastSeen: null };

    return {
      isOnline: presence.is_online,
      lastSeen: presence.last_seen
    };
  };

  // Format last seen time
  const formatLastSeen = (lastSeen: string) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMs = now.getTime() - lastSeenDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return lastSeenDate.toLocaleDateString();
  };

  useEffect(() => {
    if (!user || isInitializedRef.current) return;

    console.log('Initializing user presence for:', user.id);
    isInitializedRef.current = true;

    // Set user online when they connect
    updatePresence(true);

    // Set up heartbeat to keep user online
    heartbeatRef.current = setInterval(() => {
      updatePresence(true);
    }, 2 * 60 * 1000); // Update every 2 minutes

    // Set up real-time subscription for presence updates only if not already subscribed
    if (!channelRef.current && !isSubscribedRef.current) {
      const channelName = `user_presence_changes_${user.id}_${Date.now()}`;
      channelRef.current = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_presence'
          },
          (payload) => {
            console.log('Presence change:', payload);
            const presence = payload.new as UserPresence;
            if (presence) {
              setPresenceData(prev => ({
                ...prev,
                [presence.user_id]: presence
              }));
            }
          }
        );

      // Subscribe to the channel
      channelRef.current.subscribe((status: string) => {
        console.log('Presence channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });
    }

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence(false);
      } else {
        updatePresence(true);
      }
    };

    // Handle beforeunload to set user offline
    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      console.log('Cleaning up user presence');
      
      // Cleanup heartbeat
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = undefined;
      }
      
      // Cleanup channel
      if (channelRef.current && isSubscribedRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error removing presence channel:', error);
        }
        channelRef.current = null;
        isSubscribedRef.current = false;
      }

      // Remove event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Set user offline when component unmounts
      updatePresence(false);
      
      // Reset initialization flag
      isInitializedRef.current = false;
    };
  }, [user?.id]);

  return {
    fetchPresenceData,
    getUserStatus,
    formatLastSeen,
    updatePresence
  };
};
