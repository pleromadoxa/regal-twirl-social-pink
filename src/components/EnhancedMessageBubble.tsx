
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleActionWrapper, ChatBubbleAction } from '@/components/ui/chat-bubble';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import MessageContextMenu from './MessageContextMenu';
import MessageEditForm from './MessageEditForm';
import MessageContent from './MessageContent';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

interface EnhancedMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  currentUserId: string;
  onDelete: (messageId: string) => void;
}

const EnhancedMessageBubble = ({ message, isOwn, currentUserId, onDelete }: EnhancedMessageBubbleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', message.id)
        .eq('sender_id', currentUserId);

      if (error) throw error;

      onDelete(message.id);
      toast({
        title: "Message deleted",
        description: "Your message has been deleted"
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    }
  };

  return (
    <ChatBubble variant={isOwn ? "sent" : "received"}>
      {!isOwn && (
        <ChatBubbleAvatar
          src={message.sender_profile?.avatar_url}
          fallback={message.sender_profile?.display_name?.[0] || message.sender_profile?.username?.[0] || '?'}
        />
      )}
      <div className="flex-1 space-y-1">
        {isEditing ? (
          <MessageEditForm
            messageId={message.id}
            currentContent={message.content}
            currentUserId={currentUserId}
            onCancel={handleCancelEdit}
            onSave={handleSaveEdit}
          />
        ) : (
          <>
            <ChatBubbleMessage variant={isOwn ? "sent" : "received"}>
              <MessageContent message={message} />
            </ChatBubbleMessage>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                {message.edited_at && ' (edited)'}
              </span>
              {isOwn && (
                <ChatBubbleActionWrapper>
                  <ChatBubbleAction
                    icon={<Edit className="h-3 w-3" />}
                    onClick={handleEdit}
                  />
                  <ChatBubbleAction
                    icon={<Trash2 className="h-3 w-3" />}
                    onClick={handleDelete}
                  />
                </ChatBubbleActionWrapper>
              )}
            </div>
          </>
        )}
      </div>
      {isOwn && (
        <ChatBubbleAvatar
          src={message.sender_profile?.avatar_url}
          fallback={message.sender_profile?.display_name?.[0] || message.sender_profile?.username?.[0] || 'M'}
        />
      )}
    </ChatBubble>
  );
};

export default EnhancedMessageBubble;
