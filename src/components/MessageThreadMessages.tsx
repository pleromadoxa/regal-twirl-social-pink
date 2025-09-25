
import { useEffect, useRef, useState } from 'react';
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
}

const MessageThreadMessages = ({ 
  messages, 
  currentUserId, 
  conversationId,
  isGroup = false,
  onDeleteMessage 
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
            
            return (
              <EnhancedMessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
                currentUserId={currentUserId || ''}
                onDelete={onDeleteMessage}
                showUsername={showUsername}
              />
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
