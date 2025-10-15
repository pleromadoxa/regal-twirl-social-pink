import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CircleMessage {
  id: string;
  circle_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const useCircleMessages = (circleId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<CircleMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (circleId) {
      fetchMessages();
      subscribeToMessages();
    }

    return () => {
      // Cleanup subscription
    };
  }, [circleId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('circle_messages')
        .select(`
          *,
          profiles!circle_messages_sender_id_fkey(username, display_name, avatar_url)
        `)
        .eq('circle_id', circleId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as any);
    } catch (error) {
      console.error('Error fetching circle messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`circle-messages-${circleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'circle_messages',
          filter: `circle_id=eq.${circleId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('circle_messages')
            .select(`
              *,
              profiles!circle_messages_sender_id_fkey(username, display_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data as any]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (content: string, messageType: 'text' | 'image' | 'file' = 'text', fileUrl?: string) => {
    try {
      const { error } = await supabase
        .from('circle_messages')
        .insert({
          circle_id: circleId,
          sender_id: user?.id,
          content,
          message_type: messageType,
          file_url: fileUrl,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('circle_messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user?.id);

      if (error) throw error;

      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      
      toast({
        title: 'Success',
        description: 'Message deleted',
      });
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    deleteMessage,
    refetch: fetchMessages,
  };
};
