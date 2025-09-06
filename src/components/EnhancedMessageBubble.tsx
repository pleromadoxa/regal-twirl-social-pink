
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleActionWrapper, ChatBubbleAction } from '@/components/ui/chat-bubble';
import { VoiceBubble } from '@/components/ui/voice-bubble';
import { MoreHorizontal, Edit, Trash2, Download, Play, Image, Video, FileText } from 'lucide-react';
import MessageContextMenu from './MessageContextMenu';
import MessageEditForm from './MessageEditForm';
import MessageContent from './MessageContent';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

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

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the file",
        variant: "destructive"
      });
    }
  };

  // Check if message is voice note
  const isVoiceNote = message.message_type === 'audio' && message.metadata?.isVoiceNote;
  
  // Check for attachments
  const hasAttachments = (message as any).attachments && (message as any).attachments.length > 0;

  return (
    <div className={`flex items-end gap-2 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <ChatBubbleAvatar
          src={message.sender_profile?.avatar_url}
          fallback={message.sender_profile?.display_name?.[0] || message.sender_profile?.username?.[0] || '?'}
        />
      )}
      
      <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
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
            {/* Voice Note Bubble */}
            {isVoiceNote ? (
              <VoiceBubble
                variant={isOwn ? "sent" : "received"}
                audioUrl={message.content}
                duration={message.metadata?.duration}
                onDownload={() => handleDownload(message.content, `voice-note-${message.id}.webm`)}
              />
            ) : (
              /* Regular Text Message */
              <ChatBubbleMessage variant={isOwn ? "sent" : "received"}>
                <MessageContent message={message} />
              </ChatBubbleMessage>
            )}

            {/* Media Attachments */}
            {hasAttachments && (
              <div className="flex flex-col gap-2 max-w-sm">
                {(message as any).attachments?.map((attachment: any, index: number) => (
                  <div
                    key={index}
                    className={`relative rounded-lg overflow-hidden border ${
                      isOwn ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    {attachment.attachment_type === 'image' && (
                      <div className="relative group">
                        <img
                          src={attachment.file_url}
                          alt={attachment.file_name}
                          className="max-w-full h-auto rounded-lg"
                          style={{ maxHeight: '300px' }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-gray-700"
                            onClick={() => handleDownload(attachment.file_url, attachment.file_name)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {attachment.attachment_type === 'video' && (
                      <div className="relative group">
                        <video
                          src={attachment.file_url}
                          controls
                          className="max-w-full h-auto rounded-lg"
                          style={{ maxHeight: '300px' }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700"
                          onClick={() => handleDownload(attachment.file_url, attachment.file_name)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {attachment.attachment_type === 'document' && (
                      <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        isOwn 
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' 
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                          <p className="text-xs opacity-70">
                            {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(attachment.file_url, attachment.file_name)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Message Info and Actions */}
            <div className={`flex items-center gap-2 text-xs text-muted-foreground ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              <span>
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                {message.edited_at && ' (edited)'}
              </span>
              {isOwn && !isVoiceNote && (
                <div className="flex gap-1">
                  <ChatBubbleAction
                    icon={<Edit className="h-3 w-3" />}
                    onClick={handleEdit}
                  />
                  <ChatBubbleAction
                    icon={<Trash2 className="h-3 w-3" />}
                    onClick={handleDelete}
                  />
                </div>
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
    </div>
  );
};

export default EnhancedMessageBubble;
