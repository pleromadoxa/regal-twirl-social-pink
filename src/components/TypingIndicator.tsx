import { useEffect, useState, useRef } from 'react';
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

    console.log('[TypingIndicator] Setting up for conversation:', conversationId);

    // Clean up existing channel first
    if (channelRef.current) {
      try {
        console.log('[TypingIndicator] Cleaning up existing channel');
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.error('Error removing typing channel:', error);
      }
      channelRef.current = null;
    }

    // Create stable channel name without timestamps
    const channelName = `typing-${conversationId}`;
    
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

    // Subscribe to the channel
    channelRef.current.subscribe((status: string) => {
      console.log('[TypingIndicator] Channel subscription status:', status);
    });

    return () => {
      console.log('[TypingIndicator] Cleaning up');
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error removing typing channel:', error);
        }
        channelRef.current = null;
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