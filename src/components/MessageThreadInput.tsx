
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smile } from 'lucide-react';
import AttachmentUpload from './AttachmentUpload';

interface MessageThreadInputProps {
  onSendMessage: (content: string, attachments: File[], location?: {lat: number; lng: number; address: string}) => void;
  disabled?: boolean;
}

const MessageThreadInput = ({ onSendMessage, disabled = false }: MessageThreadInputProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sharedLocation, setSharedLocation] = useState<{lat: number; lng: number; address: string} | null>(null);

  const handleSendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0 && !sharedLocation) return;
    
    onSendMessage(newMessage.trim(), attachments, sharedLocation || undefined);
    
    // Reset form
    setNewMessage('');
    setAttachments([]);
    setSharedLocation(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-purple-200 dark:border-purple-800 p-4 space-y-3">
      {/* Attachment Upload */}
      <AttachmentUpload
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        onLocationSelect={setSharedLocation}
      />

      {/* Location Preview */}
      {sharedLocation && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <span className="text-sm">📍 Location: {sharedLocation.address}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSharedLocation(null)}
            className="h-6 w-6 p-0"
          >
            ✕
          </Button>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="rounded-full">
          <Smile className="w-4 h-4" />
        </Button>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-slate-100 dark:bg-slate-800 border-0"
          disabled={disabled}
        />
        <Button
          onClick={handleSendMessage}
          disabled={disabled || (!newMessage.trim() && attachments.length === 0 && !sharedLocation)}
          className="rounded-full w-10 h-10 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageThreadInput;
