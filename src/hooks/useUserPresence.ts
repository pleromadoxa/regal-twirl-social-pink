
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const isConnectedRef = useRef(false);

  // Update user's own presence
  const updatePresence = useCallback(async (isOnline: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('update_user_presence', {
        p_user_id: user.id,
        p_is_online: isOnline
      });

      if (error) {
        console.error('Error updating presence:', error);
        return;
      }

      // Update local state immediately
      setPresenceData(prev => ({
        ...prev,
        [user.id]: {
          user_id: user.id,
          is_online: isOnline,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('Error in updatePresence:', error);
    }
  }, [user]);

  // Fetch presence data for multiple users
  const fetchPresenceData = useCallback(async (userIds: string[]) => {
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
        // Consider users online if they were last seen within 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const lastSeen = new Date(presence.last_seen);
        const isRecentlyOnline = lastSeen > fiveMinutesAgo;
        
        acc[presence.user_id] = {
          ...presence,
          is_online: presence.is_online && isRecentlyOnline
        };
        return acc;
      }, {} as Record<string, UserPresence>);

      setPresenceData(prev => ({ ...prev, ...presenceMap }));
    } catch (error) {
      console.error('Error in fetchPresenceData:', error);
    }
  }, []);

  // Get user's online status
  const getUserStatus = useCallback((userId: string) => {
    if (!userId) return { isOnline: false, lastSeen: null };
    
    const presence = presenceData[userId];
    if (!presence) return { isOnline: false, lastSeen: null };

    // Double-check online status based on last_seen time
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const lastSeen = new Date(presence.last_seen);
    const isRecentlyOnline = lastSeen > fiveMinutesAgo;

    return {
      isOnline: presence.is_online && isRecentlyOnline,
      lastSeen: presence.last_seen
    };
  }, [presenceData]);

  // Format last seen time
  const formatLastSeen = useCallback((lastSeen: string) => {
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
  }, []);

  useEffect(() => {
    // Reset connection state when user changes
    if (isConnectedRef.current && user?.id) {
      console.log('🔄 User changed, resetting presence connection');
      isConnectedRef.current = false;
      
      // Cleanup existing connections
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = undefined;
      }
      
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error removing existing channel:', error);
        }
        channelRef.current = null;
      }
    }

    if (!user?.id || isConnectedRef.current) return;

    console.log('🟢 Initializing user presence for:', user.id);
    isConnectedRef.current = true;

    // Set user online when they connect
    updatePresence(true);

    // Set up heartbeat to keep user online (every 2 minutes)
    heartbeatRef.current = setInterval(() => {
      updatePresence(true);
    }, 2 * 60 * 1000);

    // Create a unique channel name to avoid conflicts
    const channelName = `presence_${user.id}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('📡 Creating presence channel:', channelName);
    
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
          console.log('📡 Presence change received:', payload);
          const presence = payload.new as UserPresence;
          if (presence) {
            // Consider users online if they were last seen within 5 minutes
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const lastSeen = new Date(presence.last_seen);
            const isRecentlyOnline = lastSeen > fiveMinutesAgo;
            
            setPresenceData(prev => ({
              ...prev,
              [presence.user_id]: {
                ...presence,
                is_online: presence.is_online && isRecentlyOnline
              }
            }));
          }
        }
      )
      .subscribe((status: string) => {
        console.log('📡 Presence channel subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          console.error('📡 Channel subscription error');
        }
      });

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👻 User went offline (tab hidden)');
        updatePresence(false);
      } else {
        console.log('🟢 User came back online (tab visible)');
        updatePresence(true);
      }
    };

    // Handle beforeunload to set user offline
    const handleBeforeUnload = () => {
      console.log('👋 User leaving, setting offline');
      updatePresence(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      console.log('🔧 Cleaning up user presence');
      
      // Cleanup heartbeat
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = undefined;
      }
      
      // Cleanup channel
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error removing presence channel:', error);
        }
        channelRef.current = null;
      }

      // Remove event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Set user offline when component unmounts
      updatePresence(false);
      
      // Reset connection state
      isConnectedRef.current = false;
    };
  }, [user?.id, updatePresence]);

  return {
    fetchPresenceData,
    getUserStatus,
    formatLastSeen,
    updatePresence,
    presenceData
  };
};
