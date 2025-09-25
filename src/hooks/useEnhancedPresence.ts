import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedPresence {
  user_id: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  last_seen: string;
  is_typing_in_conversation?: string;
  typing_started_at?: string;
  updated_at: string;
}

export const useEnhancedPresence = (currentUserId?: string) => {
  const [presenceData, setPresenceData] = useState<{ [userId: string]: EnhancedPresence }>({});
  const [typingUsers, setTypingUsers] = useState<{ [conversationId: string]: string[] }>({});

  const updatePresence = useCallback(async (
    status: 'online' | 'offline' | 'away' | 'busy',
    isTypingInConversation?: string
  ) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('enhanced_user_presence')
        .upsert({
          user_id: currentUserId,
          status,
          last_seen: new Date().toISOString(),
          is_typing_in_conversation: isTypingInConversation || null,
          typing_started_at: isTypingInConversation ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [currentUserId]);

  const setTyping = useCallback(async (conversationId: string, isTyping: boolean) => {
    await updatePresence(
      presenceData[currentUserId || '']?.status || 'online',
      isTyping ? conversationId : undefined
    );
  }, [currentUserId, updatePresence, presenceData]);

  const goOnline = useCallback(() => updatePresence('online'), [updatePresence]);
  const goOffline = useCallback(() => updatePresence('offline'), [updatePresence]);
  const setAway = useCallback(() => updatePresence('away'), [updatePresence]);
  const setBusy = useCallback(() => updatePresence('busy'), [updatePresence]);

  useEffect(() => {
    if (!currentUserId) return;

    // Set user as online when hook initializes
    goOnline();

    // Fetch all presence data
    const fetchPresence = async () => {
      try {
        const { data, error } = await supabase
          .from('enhanced_user_presence')
          .select('*');

        if (error) throw error;

        const presenceMap: { [userId: string]: EnhancedPresence } = {};
        const typingMap: { [conversationId: string]: string[] } = {};

        data?.forEach(presence => {
          presenceMap[presence.user_id] = {
            ...presence,
            status: presence.status as 'online' | 'offline' | 'away' | 'busy'
          };
          
          // Handle typing indicators
          if (presence.is_typing_in_conversation && presence.status === 'online') {
            const conversationId = presence.is_typing_in_conversation;
            if (!typingMap[conversationId]) {
              typingMap[conversationId] = [];
            }
            typingMap[conversationId].push(presence.user_id);
          }
        });

        setPresenceData(presenceMap);
        setTypingUsers(typingMap);
      } catch (error) {
        console.error('Error fetching presence:', error);
      }
    };

    fetchPresence();

    // Set up realtime subscription
    const subscription = supabase
      .channel('enhanced_user_presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enhanced_user_presence'
        },
        () => {
          fetchPresence();
        }
      )
      .subscribe();

    // Set user as offline when they leave
    const handleBeforeUnload = () => {
      goOffline();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Periodic presence update
    const presenceInterval = setInterval(() => {
      updatePresence(presenceData[currentUserId]?.status || 'online');
    }, 30000); // Update every 30 seconds

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(presenceInterval);
      goOffline();
    };
  }, [currentUserId]);

  return {
    presenceData,
    typingUsers,
    setTyping,
    goOnline,
    goOffline,
    setAway,
    setBusy,
    updatePresence
  };
};