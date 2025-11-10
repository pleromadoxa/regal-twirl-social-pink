import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TypingUser {
  userId: string;
  username: string;
}

export const useTypingIndicator = (conversationId: string, otherUserId?: string) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!conversationId || !user?.id) return;

    const presenceChannel = supabase.channel(`typing:${conversationId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: TypingUser[] = [];
        
        Object.keys(state).forEach(key => {
          const presences = state[key];
          presences.forEach((presence: any) => {
            if (presence.userId !== user.id && presence.isTyping) {
              users.push({
                userId: presence.userId,
                username: presence.username,
              });
            }
          });
        });
        
        setTypingUsers(users);
      })
      .subscribe();

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [conversationId, user?.id]);

  const sendTypingIndicator = useCallback(
    async (isTyping: boolean) => {
      if (!channel || !user?.id) return;

      await channel.track({
        userId: user.id,
        username: user.user_metadata?.username || user.email || 'Unknown',
        isTyping,
        timestamp: Date.now(),
      });
    },
    [channel, user]
  );

  return { typingUsers, sendTypingIndicator };
};
