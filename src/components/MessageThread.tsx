
import { useState, useEffect, useRef } from 'react';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Phone, Video, Info, Smile, Paperclip, Image, File } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import MediaUpload from '@/components/MediaUpload';

interface MessageThreadProps {
  conversationId: string;
}

const MessageThread = ({ conversationId }: MessageThreadProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { messages, conversations, sendMessage } = useEnhancedMessages();

  const conversation = conversations.find(c => c.id === conversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedImages.length === 0 && selectedVideos.length === 0) || !conversation || isSending) return;

    setIsSending(true);
    try {
      // For now, just send the text message. File uploads would need additional backend support
      if (newMessage.trim()) {
        await sendMessage(conversationId, newMessage);
        setNewMessage('');
      }
      
      // Clear attachments after sending
      setSelectedImages([]);
      setSelectedVideos([]);
      setShowAttachments(false);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Simulate typing indicator
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Conversation not found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Please select a conversation from the sidebar
          </p>
        </div>
      </div>
    );
  }

  console.log('Current conversation:', conversation);
  console.log('Messages for conversation:', messages);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversation.other_user?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {(conversation.other_user?.display_name || conversation.other_user?.username || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-slate-800 rounded-full"></div>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                {conversation.other_user?.display_name || conversation.other_user?.username || 'Unknown User'}
              </h2>
              <p className="text-sm text-slate-500">
                {isTyping ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="rounded-full">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full">
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/20 to-pink-50/20 dark:from-purple-900/10 dark:to-pink-900/10">
        {messages.length > 0 ? (
          messages.map((message, index) => {
            const isOwnMessage = message.sender_id === user?.id;
            const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
                  showAvatar ? 'mt-4' : 'mt-1'
                }`}
              >
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                  isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {showAvatar && !isOwnMessage && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={message.sender_profile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                        {(message.sender_profile?.display_name || message.sender_profile?.username || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl shadow-sm ${
                      isOwnMessage
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
                        : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-md border border-purple-200 dark:border-purple-700'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-purple-100' : 'text-slate-500'
                    }`}>
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Start the conversation
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Send your first message to get things started!
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview */}
      {showAttachments && (
        <div className="border-t border-purple-200 dark:border-purple-800 p-4 bg-white/60 dark:bg-slate-800/60">
          <MediaUpload
            selectedImages={selectedImages}
            selectedVideos={selectedVideos}
            onImagesChange={setSelectedImages}
            onVideosChange={setSelectedVideos}
          />
        </div>
      )}

      {/* Message Input */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-t border-purple-200 dark:border-purple-800 p-4">
        <div className="flex items-end space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full"
            onClick={() => setShowAttachments(!showAttachments)}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isSending}
              className="pr-12 rounded-full border-purple-200 dark:border-purple-700 focus:ring-purple-500"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && selectedImages.length === 0 && selectedVideos.length === 0) || isSending}
            className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-10 h-10 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
