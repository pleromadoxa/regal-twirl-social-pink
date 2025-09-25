
import LocationMessage from './LocationMessage';

interface Message {
  id: string;
  content: string;
  message_type?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'missed_call';
  metadata?: any;
  edited_at?: string;
}

interface MessageContentProps {
  message: Message;
}

const MessageContent = ({ message }: MessageContentProps) => {
  // Handle location messages
  if (message.message_type === 'location' && message.metadata?.location) {
    return <LocationMessage location={message.metadata.location} />;
  }

  // Handle voice messages - don't render content here, let EnhancedMessageBubble handle it
  if (message.message_type === 'audio' && (message.metadata?.isVoiceNote || message.metadata?.duration)) {
    return null; // VoiceBubble will be rendered in EnhancedMessageBubble
  }

  // Handle missed call messages
  if (message.message_type === 'missed_call') {
    return (
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
          <path d="M14.5 4l3 3m0-3l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="text-sm">
          {message.metadata?.call_type === 'video' ? 'Missed video call' : 'Missed voice call'}
          {message.metadata?.duration && ` • ${Math.round(message.metadata.duration / 1000)}s`}
        </span>
      </div>
    );
  }

  // Handle regular text messages
  return (
    <p className="text-sm whitespace-pre-wrap break-words">
      {message.content}
      {message.edited_at && (
        <span className="text-xs opacity-70 ml-2">(edited)</span>
      )}
    </p>
  );
};

export default MessageContent;
