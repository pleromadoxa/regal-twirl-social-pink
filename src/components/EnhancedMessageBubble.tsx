
import { useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { VoiceBubble } from '@/components/ui/voice-bubble';
import { Edit, Trash2, Download, FileText, Reply, Forward, MoreHorizontal } from 'lucide-react';
import MessageEditForm from './MessageEditForm';
import MessageContent from './MessageContent';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  showUsername?: boolean;
  showTimestamp?: boolean;
  onReply?: (messageId: string) => void;
}

const EnhancedMessageBubble = ({ message, isOwn, currentUserId, onDelete, showUsername = false, showTimestamp = false, onReply }: EnhancedMessageBubbleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const { toast } = useToast();

  const handleReply = () => {
    if (onReply) {
      onReply(message.id);
    }
  };

  const handleForward = () => {
    setShowForwardDialog(true);
  };

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
  const isVoiceNote = message.message_type === 'audio' && (message.metadata?.isVoiceNote || message.metadata?.duration);
  
  // Check for attachments
  const hasAttachments = (message as any).attachments && (message as any).attachments.length > 0;

  // Format timestamp WhatsApp/Instagram style
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  return (
    <div 
      className={`group mb-2 ${isOwn ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Username at the beginning of chat */}
      {showUsername && !isOwn && (
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 px-2">
          {message.sender_profile?.display_name || message.sender_profile?.username || 'Unknown'}
        </div>
      )}
      
      <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
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
            {/* Professional Message Bubble */}
            <div className="relative">
              {/* Voice Note Bubble */}
              {isVoiceNote ? (
                <VoiceBubble
                  variant={isOwn ? "sent" : "received"}
                  audioUrl={message.content.startsWith('http') ? message.content : ''}
                  duration={message.metadata?.duration}
                  onDownload={message.content.startsWith('http') ? () => handleDownload(message.content, `voice-note-${message.id}.webm`) : undefined}
                />
              ) : (
                /* Professional Text Message Bubble */
                <div className={`
                  px-4 py-2 rounded-2xl max-w-full word-wrap shadow-sm
                  ${isOwn 
                    ? 'bg-blue-500 text-white rounded-br-sm' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                  }
                `}>
                  <MessageContent message={message} />
                </div>
              )}

              {/* Action buttons - only visible on hover */}
              {showActions && (
                <div className={`
                  absolute top-0 transition-opacity duration-200
                  ${isOwn ? '-left-24' : '-right-24'}
                  flex gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1
                `}>
                  {!isOwn && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleReply}
                      title="Reply"
                    >
                      <Reply className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleForward}>
                        <Forward className="h-3 w-3 mr-2" />
                        Forward
                      </DropdownMenuItem>
                      {isOwn && (
                        <>
                          <DropdownMenuItem onClick={handleEdit}>
                            <Edit className="h-3 w-3 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={handleDelete}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Media Attachments */}
            {hasAttachments && (
              <div className="flex flex-col gap-2 max-w-sm">
                {(message as any).attachments?.map((attachment: any, index: number) => (
                  <div
                    key={index}
                    className={`relative rounded-xl overflow-hidden border shadow-sm ${
                      isOwn ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    {attachment.attachment_type === 'image' && (
                      <div className="relative group">
                        <img
                          src={attachment.file_url}
                          alt={attachment.file_name}
                          className="max-w-full h-auto rounded-xl"
                          style={{ maxHeight: '300px' }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center">
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
                          className="max-w-full h-auto rounded-xl"
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
                      <div className={`flex items-center gap-3 p-3 rounded-xl ${
                        isOwn 
                          ? 'bg-blue-50 text-blue-800' 
                          : 'bg-gray-50 dark:bg-slate-600 text-gray-800 dark:text-gray-200'
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

            {/* Simple reactions placeholder */}
            <div className="mt-1">
              {/* Reactions will be added later */}
            </div>

            {/* WhatsApp/Instagram style timestamp - only shown when showTimestamp is true */}
            {showTimestamp && (
              <div className={`text-xs text-gray-400 px-2 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                {formatTimestamp(message.created_at)}
                {message.edited_at && ' • edited'}
              </div>
            )}
          </>
        )}
      </div>

      {/* Simple Forward Dialog placeholder */}
      {showForwardDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Forward Message</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Forward: "{message.content.substring(0, 50)}..."
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setShowForwardDialog(false)} variant="outline">Cancel</Button>
              <Button onClick={() => setShowForwardDialog(false)}>Forward</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMessageBubble;
