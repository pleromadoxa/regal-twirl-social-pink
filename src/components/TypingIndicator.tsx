import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionManager } from '@/utils/subscriptionManager';

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
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user?.id || !conversationId) return;

    console.log('[TypingIndicator] Setting up for conversation:', conversationId);

    // Clean up existing subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Create stable channel name
    const channelName = `typing-${conversationId}`;
    
    // Subscribe using the subscription manager
    unsubscribeRef.current = subscriptionManager.subscribe(channelName, {
      presence: {
        event: 'sync',
        callback: () => {
          // Get presence state from the active channel
          const subscription = subscriptionManager.getDebugInfo().find(s => s.channel === channelName);
          if (!subscription) return;
          
          // We need to access the channel directly for presence state
          // This is a limitation of the abstraction - for now, keep the original approach
          const channel = supabase.channel(channelName);
          const presenceState = channel.presenceState();
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
        }
      }
    });

    return () => {
      console.log('[TypingIndicator] Cleaning up');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.id, conversationId]);

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