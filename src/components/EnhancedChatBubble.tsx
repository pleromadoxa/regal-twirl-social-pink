
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, Reply, Heart, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import MessageAttachments from './MessageAttachments';

interface EnhancedChatBubbleProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    read_at?: string;
    sender_profile?: {
      avatar_url?: string;
      display_name?: string;
      username?: string;
    };
  };
  isOwn: boolean;
  onReply?: () => void;
  onMore?: () => void;
}

const EnhancedChatBubble = ({ message, isOwn, onReply, onMore }: EnhancedChatBubbleProps) => {
  const sender = message.sender_profile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 max-w-[80%] ${isOwn ? 'justify-end ml-auto' : 'justify-start'}`}
    >
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-white dark:ring-slate-800">
          <AvatarImage src={sender?.avatar_url || ''} />
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
            {sender?.display_name?.[0] || sender?.username?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`group relative ${isOwn ? 'order-1' : ''}`}>
        {/* Message Bubble */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className={`relative px-4 py-3 rounded-2xl shadow-sm backdrop-blur-sm ${
            isOwn 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white ml-2' 
              : 'bg-white/90 dark:bg-slate-700/90 text-slate-900 dark:text-white mr-2 border border-purple-100 dark:border-purple-800'
          }`}
        >
          {/* Message Content */}
          <p className="text-sm break-words leading-relaxed">{message.content}</p>
          
          {/* Hover Actions */}
          <div className={`absolute top-1 ${isOwn ? 'left-1' : 'right-1'} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
            <div className="flex items-center gap-1">
              {!isOwn && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onReply}
                  className="h-6 w-6 p-0 hover:bg-white/20 rounded-full"
                >
                  <Reply className="w-3 h-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={onMore}
                className="h-6 w-6 p-0 hover:bg-white/20 rounded-full"
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Message Status Indicator for Own Messages */}
          {isOwn && (
            <div className="absolute -bottom-1 -right-1">
              {message.read_at ? (
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-white">✓✓</span>
                </div>
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-white">✓</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
        
        {/* Message Attachments */}
        <div className={`mt-2 ${isOwn ? 'text-right' : 'text-left'}`}>
          <MessageAttachments messageId={message.id} />
        </div>
        
        {/* Timestamp */}
        <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </p>
      </div>

      {isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0 order-2 ring-2 ring-white dark:ring-slate-800">
          <AvatarImage src={sender?.avatar_url || ''} />
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
            {sender?.display_name?.[0] || sender?.username?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
};

export default EnhancedChatBubble;
