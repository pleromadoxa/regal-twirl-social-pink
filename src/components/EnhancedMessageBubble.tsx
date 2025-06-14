
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import MessageContextMenu from './MessageContextMenu';
import MessageAttachments from './MessageAttachments';
import LocationMessage from './LocationMessage';
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
  const [editedContent, setEditedContent] = useState(message.content);
  const { toast } = useToast();

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) {
      toast({
        title: "Error",
        description: "Message cannot be empty",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: editedContent.trim(),
          edited_at: new Date().toISOString()
        })
        .eq('id', message.id)
        .eq('sender_id', currentUserId);

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Message updated",
        description: "Your message has been edited"
      });
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(message.content);
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

  const renderMessageContent = () => {
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
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="bg-transparent border-white/20 text-inherit"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit();
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit} className="h-6 px-2">
                  <Check className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-6 px-2">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              {renderMessageContent()}
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

export default EnhancedMessageBubble;

