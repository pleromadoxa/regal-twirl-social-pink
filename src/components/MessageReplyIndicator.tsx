import React from 'react';
import { Reply } from 'lucide-react';

interface MessageReplyIndicatorProps {
  replyData: {
    messageId: string;
    content: string;
    senderId: string;
    senderName: string;
  };
  className?: string;
}

const MessageReplyIndicator = ({ replyData, className = '' }: MessageReplyIndicatorProps) => {
  return (
    <div className={`bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 p-2 mb-2 rounded-r-lg ${className}`}>
      <div className="flex items-start gap-2">
        <Reply className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
            Replying to {replyData.senderName}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {replyData.content.length > 100 
              ? replyData.content.substring(0, 100) + '...'
              : replyData.content
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageReplyIndicator;