
import { useState } from 'react';
import MessageContextMenu from './MessageContextMenu';
import MessageEditForm from './MessageEditForm';
import MessageContent from './MessageContent';
import MessageBubbleLayout from './MessageBubbleLayout';
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
    <MessageBubbleLayout message={message} isOwn={isOwn}>
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
          <MessageContent message={message} />
          <div className={`absolute top-1 ${isOwn ? 'left-1' : 'right-1'}`}>
            <MessageContextMenu
              messageId={message.id}
              content={message.content}
              isOwnMessage={isOwn}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </>
      )}
    </MessageBubbleLayout>
  );
};

export default EnhancedMessageBubble;
