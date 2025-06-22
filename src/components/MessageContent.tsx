
import LocationMessage from './LocationMessage';

interface Message {
  id: string;
  content: string;
  message_type?: string;
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
