import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TypingIndicatorProps {
  conversationId: string;
  isGroup?: boolean;
}

interface TypingUser {
  id: string;
  display_name?: string;
  username?: string;
}

export const TypingIndicator = ({ conversationId, isGroup = false }: TypingIndicatorProps) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const { user } = useAuth();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user?.id || !conversationId) return;

    // Create unique channel name with timestamp to avoid conflicts
    const channelName = `typing-${conversationId}-${Date.now()}`;
    
    // Clean up existing channel
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.error('Error removing typing channel:', error);
      }
      channelRef.current = null;
    }

    channelRef.current = supabase.channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        if (!channelRef.current) return;
        
        const presenceState = channelRef.current.presenceState();
        const users: TypingUser[] = [];
        
        Object.values(presenceState).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id !== user.id && presence.typing) {
              users.push({
                id: presence.user_id,
                display_name: presence.display_name,
                username: presence.username
              });
            }
          });
        });
        
        setTypingUsers(users);
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error removing typing channel:', error);
        }
        channelRef.current = null;
      }
    };
  }, [user?.id, conversationId]);

  const handleStartTyping = useCallback(() => {
    if (!user?.id || !channelRef.current) return;

    channelRef.current.track({
      user_id: user.id,
      display_name: user.user_metadata?.display_name || user.email,
      username: user.user_metadata?.username,
      typing: true,
      online_at: new Date().toISOString(),
    });
  }, [user]);

  const handleStopTyping = useCallback(() => {
    if (!user?.id || !channelRef.current) return;

    channelRef.current.track({
      user_id: user.id,
      display_name: user.user_metadata?.display_name || user.email,
      username: user.user_metadata?.username,
      typing: false,
      online_at: new Date().toISOString(),
    });
  }, [user]);

  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span>
        {typingUsers.length === 1 
          ? `${typingUsers[0].display_name || typingUsers[0].username} is typing...`
          : `${typingUsers.length} people are typing...`
        }
      </span>
    </div>
  );
};

// Create a typing channel manager to prevent multiple subscriptions
const typingChannels = new Map<string, any>();

// Export typing functions for use in message input components
export const useTypingIndicator = (conversationId: string) => {
  const { user } = useAuth();

  const startTyping = useCallback(() => {
    if (!user?.id || !conversationId) return;

    const channelName = `typing-${conversationId}`;
    let channel = typingChannels.get(channelName);

    if (!channel) {
      channel = supabase.channel(channelName);
      typingChannels.set(channelName, channel);
      // Subscribe only once per channel
      channel.subscribe();
    }

    channel.track({
      user_id: user.id,
      display_name: user.user_metadata?.display_name || user.email,
      username: user.user_metadata?.username,
      typing: true,
      online_at: new Date().toISOString(),
    });
  }, [user, conversationId]);

  const stopTyping = useCallback(() => {
    if (!user?.id || !conversationId) return;

    const channelName = `typing-${conversationId}`;
    const channel = typingChannels.get(channelName);

    if (channel) {
      channel.track({
        user_id: user.id,
        display_name: user.user_metadata?.display_name || user.email,
        username: user.user_metadata?.username,
        typing: false,
        online_at: new Date().toISOString(),
      });
    }
  }, [user, conversationId]);

  return { startTyping, stopTyping };
};