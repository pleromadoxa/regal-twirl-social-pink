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
  const [uploading, setUploading] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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
        });

      if (error) throw error;

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
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
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
            onChange={(e) => setNewMessage(e.target.value)}
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
