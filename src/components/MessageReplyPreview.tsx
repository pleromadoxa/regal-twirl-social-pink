import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  message_type?: string;
  sender_profile?: {
    display_name?: string;
    username?: string;
  };
}

interface MessageReplyPreviewProps {
  replyToMessageId: string | null;
  onCancel: () => void;
  className?: string;
}

const MessageReplyPreview = ({ replyToMessageId, onCancel, className = '' }: MessageReplyPreviewProps) => {
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!replyToMessageId) {
      setReplyMessage(null);
      return;
    }

    const fetchReplyMessage = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            sender_id,
            message_type
          `)
          .eq('id', replyToMessageId)
          .single();

        if (error) throw error;
        setReplyMessage(data);
      } catch (error) {
        console.error('Error fetching reply message:', error);
      }
    };

    fetchReplyMessage();
  }, [replyToMessageId]);

  if (!replyMessage) return null;

  const getMessagePreview = (message: Message) => {
    if (message.message_type === 'image') return '📷 Image';
    if (message.message_type === 'video') return '🎥 Video';
    if (message.message_type === 'audio') return '🎵 Voice message';
    if (message.message_type === 'document') return '📄 Document';
    return message.content.length > 50 
      ? message.content.substring(0, 50) + '...'
      : message.content;
  };

  const senderName = replyMessage.sender_profile?.display_name || 
                    replyMessage.sender_profile?.username || 
                    'Unknown User';

  return (
    <div className={`bg-gray-100 dark:bg-gray-800 border-l-4 border-blue-500 p-3 mx-4 mb-2 rounded-r-lg ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Replying to {senderName}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {getMessagePreview(replyMessage)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={onCancel}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default MessageReplyPreview;