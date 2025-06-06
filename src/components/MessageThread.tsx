
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Phone, Video, MoreVertical } from 'lucide-react';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { formatDistanceToNow } from 'date-fns';
import { WavyMessage } from '@/components/ui/wavy-message';

interface MessageThreadProps {
  conversationId: string;
}

const MessageThread = ({ conversationId }: MessageThreadProps) => {
  const {
    messages,
    sendMessage,
    markAsRead,
    selectedConversation,
    setSelectedConversation,
    conversations,
    activeCall,
    setActiveCall,
    typingUsers
  } = useEnhancedMessages();

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedConversation(conversationId);
  }, [conversationId, setSelectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage(newMessage.trim());
    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }
  };

  const currentConversation = conversations.find(c => c.id === conversationId);
  const otherUser = currentConversation?.other_user;

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUser?.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {otherUser?.display_name?.[0] || otherUser?.username?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {otherUser?.display_name || otherUser?.username || 'Unknown User'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {typingUsers[conversationId] ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveCall({ type: 'audio', userId: otherUser?.id })}
            className="text-slate-600 hover:text-purple-600 dark:text-slate-400"
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveCall({ type: 'video', userId: otherUser?.id })}
            className="text-slate-600 hover:text-purple-600 dark:text-slate-400"
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-600 hover:text-purple-600 dark:text-slate-400"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.sender_id !== otherUser?.id;
            const sender = message.sender_profile;
            
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                onMouseEnter={() => !message.read_at && markAsRead(message.id)}
              >
                {!isOwn && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={sender?.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                      {sender?.display_name?.[0] || sender?.username?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`${isOwn ? 'order-1' : ''}`}>
                  <WavyMessage isOwn={isOwn}>
                    {message.content}
                  </WavyMessage>
                  <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    {isOwn && message.read_at && (
                      <span className="ml-1 text-purple-500">✓✓</span>
                    )}
                  </p>
                </div>

                {isOwn && (
                  <Avatar className="w-8 h-8 flex-shrink-0 order-2">
                    <AvatarImage src={sender?.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                      {sender?.display_name?.[0] || sender?.username?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MessageThread;
