import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!user?.id || !conversationId) return;

    const channel = supabase.channel(`typing-${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
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
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, conversationId]);

  const handleStartTyping = () => {
    if (!user?.id) return;

    const channel = supabase.channel(`typing-${conversationId}`);
    channel.track({
      user_id: user.id,
      display_name: user.user_metadata?.display_name || user.email,
      username: user.user_metadata?.username,
      typing: true,
      online_at: new Date().toISOString(),
    });
  };

  const handleStopTyping = () => {
    if (!user?.id) return;

    const channel = supabase.channel(`typing-${conversationId}`);
    channel.track({
      user_id: user.id,
      display_name: user.user_metadata?.display_name || user.email,
      username: user.user_metadata?.username,
      typing: false,
      online_at: new Date().toISOString(),
    });
  };

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

// Export typing functions for use in message input components
export const useTypingIndicator = (conversationId: string) => {
  const { user } = useAuth();

  const startTyping = () => {
    if (!user?.id) return;

    const channel = supabase.channel(`typing-${conversationId}`);
    channel.track({
      user_id: user.id,
      display_name: user.user_metadata?.display_name || user.email,
      username: user.user_metadata?.username,
      typing: true,
      online_at: new Date().toISOString(),
    });
  };

  const stopTyping = () => {
    if (!user?.id) return;

    const channel = supabase.channel(`typing-${conversationId}`);
    channel.track({
      user_id: user.id,
      display_name: user.user_metadata?.display_name || user.email,
      username: user.user_metadata?.username,
      typing: false,
      online_at: new Date().toISOString(),
    });
  };

  return { startTyping, stopTyping };
};