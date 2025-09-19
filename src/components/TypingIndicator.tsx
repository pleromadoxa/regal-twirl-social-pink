import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToTyping } from '@/services/messageService';

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
  const subscriptionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user?.id || !conversationId) return;

    // Clean up any existing subscription first
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }

    // Use the messageService typing system to avoid conflicts
    const typingSubscription = subscribeToTyping(conversationId, user.id, (isTyping, userId) => {
      // This is just a placeholder - the actual typing state is managed by the presence system
      // The TypingIndicator will show typing users through the presence channel
    });

    subscriptionRef.current = typingSubscription.unsubscribe;

    // Create unique channel name with timestamp to avoid conflicts
    const channelName = `typing-${conversationId}-${user.id}-${Date.now()}`;
    
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
      });

    // Subscribe only if not already subscribed
    if (channelRef.current.state !== 'joined' && channelRef.current.state !== 'joining') {
      channelRef.current.subscribe();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
      
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

// Unified typing functions that use the messageService system
export const useTypingIndicator = (conversationId: string) => {
  const { user } = useAuth();

  const startTyping = useCallback(() => {
    if (!user?.id || !conversationId) return;

    // Use the unified subscribeToTyping from messageService
    subscribeToTyping(conversationId, user.id, () => {});
  }, [user, conversationId]);

  const stopTyping = useCallback(() => {
    if (!user?.id || !conversationId) return;
    
    // The actual typing state is managed by the messageService
    // This is just a placeholder for now since subscribeToTyping handles the state
  }, [user, conversationId]);

  return { startTyping, stopTyping };
};