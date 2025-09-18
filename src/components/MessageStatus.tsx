import { Check, CheckCheck, Clock } from 'lucide-react';

interface MessageStatusProps {
  message: {
    id: string;
    created_at: string;
    read_at?: string | null;
    sender_id: string;
  };
  currentUserId: string;
  isGroup?: boolean;
}

export const MessageStatus = ({ message, currentUserId, isGroup = false }: MessageStatusProps) => {
  // Only show status for messages sent by current user
  if (message.sender_id !== currentUserId) return null;

  const getStatusIcon = () => {
    if (isGroup) {
      // For group messages, just show sent status
      return <Check className="w-3 h-3 text-gray-400" />;
    }

    if (message.read_at) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    }

    return <Check className="w-3 h-3 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isGroup) return 'Sent';
    
    if (message.read_at) return 'Read';
    return 'Sent';
  };

  return (
    <div className="flex items-center space-x-1 text-xs text-gray-400">
      <Clock className="w-3 h-3" />
      <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      {getStatusIcon()}
      <span className="sr-only">{getStatusText()}</span>
    </div>
  );
};