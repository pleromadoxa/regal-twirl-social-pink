
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smile } from 'lucide-react';
import AttachmentUpload from './AttachmentUpload';
import DragDropMediaUpload from './DragDropMediaUpload';
import EnhancedEmojiPicker from './EnhancedEmojiPicker';
import AnimatedEmoji, { EmojiRain } from './AnimatedEmoji';

interface MessageThreadInputProps {
  onSendMessage: (content: string, attachments: File[], location?: {lat: number; lng: number; address: string}) => void;
  disabled?: boolean;
  onTyping?: (isTyping: boolean) => void;
}

const MessageThreadInput = ({ onSendMessage, disabled = false, onTyping }: MessageThreadInputProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sharedLocation, setSharedLocation] = useState<{lat: number; lng: number; address: string} | null>(null);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadedTypes, setUploadedTypes] = useState<string[]>([]);
  const [showEmojiRain, setShowEmojiRain] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Send typing indicator
    if (onTyping) {
      if (value.trim()) {
        onTyping(true);
        
        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          onTyping(false);
        }, 2000);
      } else {
        onTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    
    // Trigger special effects for certain emojis
    const specialEmojis = ['🎉', '🎊', '✨', '🔥', '💥', '🌟'];
    if (specialEmojis.includes(emoji)) {
      setShowEmojiRain(emoji);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0 && !sharedLocation) return;
    
    // Stop typing indicator when sending
    if (onTyping) {
      onTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
    
    onSendMessage(newMessage.trim(), attachments, sharedLocation || undefined);
    
    // Reset form
    setNewMessage('');
    setAttachments([]);
    setSharedLocation(null);
    setUploadedUrls([]);
    setUploadedTypes([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <DragDropMediaUpload
      onFileUpload={(files) => setAttachments(prev => [...prev, ...files])}
      onUrlsGenerated={(urls, types) => {
        setUploadedUrls(prev => [...prev, ...urls]);
        setUploadedTypes(prev => [...prev, ...types]);
      }}
      className="border-t border-purple-200 dark:border-purple-800"
    >
      <div className="p-3 sm:p-4 pb-safe space-y-3">
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
          <EnhancedEmojiPicker onEmojiSelect={handleEmojiSelect}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full shrink-0 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              type="button"
            >
              <AnimatedEmoji emoji="😊" animation="pulse" size="sm" />
            </Button>
          </EnhancedEmojiPicker>
          <Input
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-slate-100 dark:bg-slate-800 border-0 text-sm sm:text-base min-w-0 focus:ring-2 focus:ring-purple-500"
            disabled={disabled}
          />
          <Button
            onClick={handleSendMessage}
            disabled={disabled || (!newMessage.trim() && attachments.length === 0 && !sharedLocation)}
            className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shrink-0 transition-all duration-200 hover:scale-105"
          >
            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
        
        {/* Emoji Rain Effect */}
        {showEmojiRain && (
          <EmojiRain
            emoji={showEmojiRain}
            duration={2000}
            onComplete={() => setShowEmojiRain(null)}
          />
        )}
      </div>
    </DragDropMediaUpload>
  );
};

export default MessageThreadInput;
