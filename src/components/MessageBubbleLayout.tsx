
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import MessageAttachments from './MessageAttachments';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at?: string;
  sender_profile?: {
    avatar_url?: string;
    display_name?: string;
    username?: string;
  };
}

interface MessageBubbleLayoutProps {
  message: Message;
  isOwn: boolean;
  children: React.ReactNode;
}

const MessageBubbleLayout = ({ message, isOwn, children }: MessageBubbleLayoutProps) => {
  return (
    <div
      className={`group flex items-end ${isOwn ? 'justify-end' : 'justify-start'} my-2`}
    >
      {!isOwn && (
        <Avatar className="h-8 w-8 mr-2 mt-auto">
          <AvatarImage 
            src={message.sender_profile?.avatar_url || "/placeholder.svg"} 
          />
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
            {(message.sender_profile?.display_name || message.sender_profile?.username || 'U')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-[75vw] md:max-w-[60vw] flex flex-col items-${isOwn ? 'end' : 'start'}`}>
        <div
          className={`
            relative px-4 py-2 rounded-2xl shadow-md 
            ${isOwn
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-md'}
            inline-block
            min-w-[40px] max-w-full
            text-left
            transition-all
          `}
          style={{
            wordBreak: 'break-word',
            width: 'fit-content',
            minWidth: '2.5rem',
          }}
        >
          {children}
        </div>
        <div className={`mt-2 ${isOwn ? 'text-right' : 'text-left'}`}>
          <MessageAttachments messageId={message.id} />
        </div>
        <p className={`text-xs mt-1 ${isOwn ? 'text-slate-400 text-right' : 'text-slate-500 text-left'} w-full`}>
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          {message.read_at && isOwn && (
            <span className="ml-2">✓✓</span>
          )}
        </p>
      </div>

      {isOwn && (
        <Avatar className="h-8 w-8 ml-2 mt-auto">
          <AvatarImage 
            src={message.sender_profile?.avatar_url || "/placeholder.svg"} 
          />
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
            {(message.sender_profile?.display_name || message.sender_profile?.username || 'U')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubbleLayout;
