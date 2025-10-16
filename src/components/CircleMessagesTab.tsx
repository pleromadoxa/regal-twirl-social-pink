import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, Image as ImageIcon, File as FileIcon, Smile, Loader2, X, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface CircleMessage {
  id: string;
  circle_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  reply_to_id?: string;
  reply_to?: CircleMessage;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface TypingUser {
  user_id: string;
  profiles?: {
    username: string;
    display_name: string;
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
  const [uploading, setUploading] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [replyingTo, setReplyingTo] = useState<CircleMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const typingChannelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
    subscribeToTypingIndicators();
    subscribeToPresence();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
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
          profiles!circle_messages_sender_id_fkey(username, display_name, avatar_url),
          reply_to:circle_messages!reply_to_id(
            id,
            content,
            message_type,
            sender_id,
            profiles!circle_messages_sender_id_fkey(username, display_name, avatar_url)
          )
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
          // Fetch the complete message with profile and reply data
          const { data } = await supabase
            .from('circle_messages')
            .select(`
              *,
              profiles!circle_messages_sender_id_fkey(username, display_name, avatar_url),
              reply_to:circle_messages!reply_to_id(
                id,
                content,
                message_type,
                sender_id,
                profiles!circle_messages_sender_id_fkey(username, display_name, avatar_url)
              )
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

  const subscribeToTypingIndicators = () => {
    typingChannelRef.current = supabase
      .channel(`circle-typing-${circleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'circle_typing_indicators',
          filter: `circle_id=eq.${circleId}`,
        },
        async () => {
          // Fetch current typing users
          const { data } = await supabase
            .from('circle_typing_indicators')
            .select(`
              user_id,
              profiles!circle_typing_indicators_user_id_fkey(username, display_name)
            `)
            .eq('circle_id', circleId)
            .neq('user_id', user?.id)
            .gte('updated_at', new Date(Date.now() - 10000).toISOString());

          if (data) {
            setTypingUsers(data as any);
          }
        }
      )
      .subscribe();
  };

  const subscribeToPresence = () => {
    presenceChannelRef.current = supabase
      .channel(`circle-presence-${circleId}`, {
        config: { presence: { key: user?.id } },
      })
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannelRef.current?.presenceState();
        const online = new Set<string>();
        
        Object.keys(state || {}).forEach((key) => {
          const presences = state[key];
          presences.forEach((presence: any) => {
            if (presence.user_id) {
              online.add(presence.user_id);
            }
          });
        });
        
        setOnlineUsers(online);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannelRef.current?.track({
            user_id: user?.id,
            online_at: new Date().toISOString(),
          });
        }
      });
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
          reply_to_id: replyingTo?.id,
        });

      if (error) throw error;

      setNewMessage('');
      setReplyingTo(null);
      await removeTypingIndicator();
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

  const handleTyping = async () => {
    // Update typing indicator
    await supabase
      .from('circle_typing_indicators')
      .upsert({
        circle_id: circleId,
        user_id: user?.id,
        updated_at: new Date().toISOString(),
      });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Remove typing indicator after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(async () => {
      await removeTypingIndicator();
    }, 3000);
  };

  const removeTypingIndicator = async () => {
    await supabase
      .from('circle_typing_indicators')
      .delete()
      .eq('circle_id', circleId)
      .eq('user_id', user?.id);
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.native);
    setEmojiPickerOpen(false);
  };

  const handleFileUpload = async (file: File, type: 'image' | 'file') => {
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${circleId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const bucket = type === 'image' ? 'circle-images' : 'circle-images';

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Send message with file
      const { error } = await supabase
        .from('circle_messages')
        .insert({
          circle_id: circleId,
          sender_id: user?.id,
          content: type === 'image' ? '📷 Image' : `📎 ${file.name}`,
          message_type: type,
          file_url: publicUrl,
          reply_to_id: replyingTo?.id,
        });

      if (error) throw error;
      
      setReplyingTo(null);

      toast({
        title: 'Success',
        description: `${type === 'image' ? 'Image' : 'File'} uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
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
                  className={`flex gap-3 group ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={message.profiles?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {message.profiles?.display_name?.[0]?.toUpperCase() || 
                         message.profiles?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {onlineUsers.has(message.sender_id) && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  
                  <div className={`flex flex-col gap-1 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">
                        {isOwnMessage ? 'You' : (message.profiles?.display_name || message.profiles?.username)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(message.created_at)}
                      </span>
                    </div>
                    
                    {/* Reply Preview */}
                    {message.reply_to && (
                      <div className="text-xs bg-muted/50 rounded-lg px-3 py-2 mb-1 border-l-2 border-primary max-w-full">
                        <div className="font-medium text-primary mb-0.5">
                          Replying to {message.reply_to.profiles?.display_name || message.reply_to.profiles?.username}
                        </div>
                        <div className="text-muted-foreground truncate">
                          {message.reply_to.message_type === 'image' ? '📷 Image' : 
                           message.reply_to.message_type === 'file' ? '📎 File' :
                           message.reply_to.content}
                        </div>
                      </div>
                    )}
                    
                    <div className="relative group">
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                      {message.message_type === 'image' && message.file_url ? (
                        <div className="space-y-2">
                          <img 
                            src={message.file_url} 
                            alt="Shared image" 
                            className="max-w-sm rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(message.file_url, '_blank')}
                          />
                          {message.content && message.content !== '📷 Image' && (
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          )}
                        </div>
                      ) : message.message_type === 'file' && message.file_url ? (
                        <div className="flex items-center gap-2">
                          <FileIcon className="w-5 h-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm whitespace-pre-wrap break-words truncate">
                              {message.content}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 h-8 w-8"
                            onClick={() => window.open(message.file_url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}
                      </div>
                      
                      {/* Reply Button */}
                      {!isOwnMessage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          onClick={() => setReplyingTo(message)}
                        >
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>
                {typingUsers.length === 1 
                  ? `${typingUsers[0].profiles?.display_name || typingUsers[0].profiles?.username} is typing...`
                  : `${typingUsers.length} people are typing...`}
              </span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        {/* Reply Preview */}
        {replyingTo && (
          <div className="mb-2 flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 border-l-2 border-primary">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-primary mb-0.5">
                Replying to {replyingTo.profiles?.display_name || replyingTo.profiles?.username}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {replyingTo.message_type === 'image' ? '📷 Image' : 
                 replyingTo.message_type === 'file' ? '📎 File' :
                 replyingTo.content}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => setReplyingTo(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {uploading && (
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Uploading...</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, 'image');
              e.target.value = '';
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, 'file');
              e.target.value = '';
            }}
          />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={handleImageClick}
            disabled={uploading}
            title="Upload image"
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={handleFileClick}
            disabled={uploading}
            title="Upload file"
          >
            <FileIcon className="w-5 h-5" />
          </Button>
          
          <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                title="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 border-0" align="start">
              <Picker 
                data={data} 
                onEmojiSelect={handleEmojiSelect}
                theme="auto"
                previewPosition="none"
              />
            </PopoverContent>
          </Popover>
          
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1"
            disabled={loading || uploading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || loading || uploading}
            className="flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
