
import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import EnhancedMessageBubble from './EnhancedMessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at?: string;
  edited_at?: string;
  message_type?: string;
  metadata?: any;
  sender_profile?: {
    avatar_url?: string;
    display_name?: string;
    username?: string;
  };
}

interface MessageThreadMessagesProps {
  messages: Message[];
  currentUserId?: string;
  conversationId: string;
  isGroup?: boolean;
  onDeleteMessage: (messageId: string) => void;
  onReply?: (messageId: string) => void;
}

const MessageThreadMessages = ({ 
  messages, 
  currentUserId, 
  conversationId,
  isGroup = false,
  onDeleteMessage,
  onReply
}: MessageThreadMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <ScrollArea className="flex-1 px-4 py-2 bg-white dark:bg-gray-900" ref={scrollAreaRef}>
      {messages.length > 0 ? (
          <div className="space-y-1">
            {messages.map((message, index) => {
              // Show username if it's the first message from this sender in a sequence
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const showUsername = message.sender_id !== currentUserId && 
                (!previousMessage || previousMessage.sender_id !== message.sender_id);
              
              // Show timestamp based on time interval (5+ minutes gap or different day)
              const showTimestamp = !previousMessage || 
                new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime() > 5 * 60 * 1000 ||
                new Date(message.created_at).toDateString() !== new Date(previousMessage.created_at).toDateString();
              
              return (
                <div key={message.id}>
                  {showTimestamp && (
                    <div className="flex justify-center mb-2">
                      <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        {(() => {
                          const messageDate = new Date(message.created_at);
                          const today = new Date();
                          const yesterday = new Date(today);
                          yesterday.setDate(yesterday.getDate() - 1);
                          
                          if (messageDate.toDateString() === today.toDateString()) {
                            return `Today ${messageDate.toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}`;
                          } else if (messageDate.toDateString() === yesterday.toDateString()) {
                            return `Yesterday ${messageDate.toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}`;
                          } else {
                            return messageDate.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            });
                          }
                        })()}
                      </div>
                    </div>
                  )}
                  <EnhancedMessageBubble
                    message={message}
                    isOwn={message.sender_id === currentUserId}
                    currentUserId={currentUserId || ''}
                    onDelete={onDeleteMessage}
                    showUsername={showUsername}
                    showTimestamp={false}
                    onReply={onReply}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-slate-500">No messages yet</p>
              <p className="text-sm text-slate-400 mt-1">Start the conversation!</p>
            </div>
          </div>
        )}
        
      {/* Typing Indicator */}
      <TypingIndicator 
        conversationId={conversationId} 
        isGroup={isGroup} 
      />
    </ScrollArea>
  );
};

export default MessageThreadMessages;
