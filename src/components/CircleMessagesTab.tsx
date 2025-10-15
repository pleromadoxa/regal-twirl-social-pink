import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Image, File, Smile, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CircleMessage {
  id: string;
  circle_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface CircleMessagesTabProps {
  circleId: string;
}

export const CircleMessagesTab = ({ circleId }: CircleMessagesTabProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<CircleMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [circleId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
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
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    }
  };

  const subscribeToMessages = () => {
    channelRef.current = supabase
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
          // Fetch the complete message with profile data
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
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('circle_messages')
        .insert({
          circle_id: circleId,
          sender_id: user?.id,
          content: newMessage.trim(),
          message_type: 'text',
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className="flex flex-col h-[600px] bg-background rounded-lg border">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === user?.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={message.profiles?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {message.profiles?.display_name?.[0]?.toUpperCase() || 
                       message.profiles?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex flex-col gap-1 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">
                        {isOwnMessage ? 'You' : (message.profiles?.display_name || message.profiles?.username)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(message.created_at)}
                      </span>
                    </div>
                    
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
          >
            <Image className="w-5 h-5" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
          >
            <File className="w-5 h-5" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
          >
            <Smile className="w-5 h-5" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={loading}
          />
          
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || loading}
            className="flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
