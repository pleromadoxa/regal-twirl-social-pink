
import { useState, useEffect, useRef } from 'react';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from '@/components/ui/context-menu';
import { Send, Phone, Video, Info, Paperclip, Zap, Settings, Copy, Reply, Forward, Delete, Pin, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import MediaUpload from '@/components/MediaUpload';
import EmojiPicker from '@/components/EmojiPicker';
import VideoCall from '@/components/VideoCall';
import EnhancedAudioCall from '@/components/EnhancedAudioCall';
import IncomingCallPopup from '@/components/IncomingCallPopup';
import CallHistoryDialog from '@/components/CallHistoryDialog';
import GroupCallDialog from '@/components/GroupCallDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCallSounds } from '@/hooks/useCallSounds';

interface MessageThreadProps {
  conversationId: string;
}

const MessageThread = ({ conversationId }: MessageThreadProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isAudioCallActive, setIsAudioCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    callType: 'audio' | 'video';
    roomId?: string;
  } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const callChannelRef = useRef<any>(null);
  const { user } = useAuth();
  const { messages, conversations, sendMessage, sendTypingIndicator, typingUsers } = useEnhancedMessages();
  const { toast } = useToast();
  const { playRinging, stopRinging, playEndCall, playConnect } = useCallSounds();

  const conversation = conversations.find(c => c.id === conversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced call notification listener with better error handling
  useEffect(() => {
    if (!user || !conversation) return;

    console.log('Setting up call notifications for conversation:', conversationId);

    // Clean up existing channel
    if (callChannelRef.current) {
      supabase.removeChannel(callChannelRef.current);
    }

    const channelName = `call-notifications-${conversationId}`;
    const channel = supabase.channel(channelName);
    
    channel.on('broadcast', { event: 'incoming-call' }, (payload) => {
      console.log('Received incoming call notification:', payload);
      const { caller_id, caller_name, caller_avatar, call_type, conversation_id } = payload.payload;
      
      if (conversation_id === conversationId && caller_id !== user.id) {
        console.log('Processing incoming call from:', caller_name);
        setIncomingCall({
          callerId: caller_id,
          callerName: caller_name,
          callerAvatar: caller_avatar,
          callType: call_type
        });
        
        // Play ringing sound
        playRinging();
        
        toast({
          title: "Incoming call",
          description: `${caller_name} is calling you`
        });
      }
    });

    channel.on('broadcast', { event: 'group-call-invitation' }, (payload) => {
      console.log('Received group call invitation:', payload);
      const { room_id, initiator_id, initiator_name, initiator_avatar, call_type, recipient_id } = payload.payload;
      
      if (recipient_id === user.id && initiator_id !== user.id) {
        setIncomingCall({
          callerId: initiator_id,
          callerName: initiator_name,
          callerAvatar: initiator_avatar,
          callType: call_type,
          roomId: room_id
        });
        
        playRinging();
        
        toast({
          title: "Group call invitation",
          description: `${initiator_name} invited you to a group ${call_type} call`
        });
      }
    });

    channel.on('broadcast', { event: 'call-ended' }, (payload) => {
      console.log('Call ended notification:', payload);
      setIncomingCall(null);
      stopRinging();
    });

    channel.subscribe((status) => {
      console.log('Call notification channel status:', status);
      if (status === 'SUBSCRIBED') {
        callChannelRef.current = channel;
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Channel subscription error');
        setTimeout(() => {
          // Retry subscription
          channel.subscribe();
        }, 2000);
      }
    });

    return () => {
      console.log('Cleaning up call notification channel');
      if (callChannelRef.current) {
        supabase.removeChannel(callChannelRef.current);
        callChannelRef.current = null;
      }
      stopRinging();
    };
  }, [user, conversationId, conversation, playRinging, stopRinging, toast]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedImages.length === 0 && selectedVideos.length === 0 && selectedDocuments.length === 0) || !conversation || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(conversationId, newMessage, {
        images: selectedImages,
        videos: selectedVideos,
        documents: selectedDocuments
      });
      setNewMessage('');
      setSelectedImages([]);
      setSelectedVideos([]);
      setSelectedDocuments([]);
      setShowAttachments(false);
      
      sendTypingIndicator(conversationId, false);
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
    
    sendTypingIndicator(conversationId, true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(conversationId, false);
    }, 2000);
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleMessageAction = (action: string, messageId: string, messageContent: string) => {
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(messageContent);
        toast({
          title: "Copied to clipboard",
          description: "Message copied to clipboard"
        });
        break;
      case 'reply':
        setNewMessage(`@${conversation?.other_user?.username} `);
        break;
      case 'forward':
        console.log('Forward message:', messageId);
        break;
      case 'delete':
        console.log('Delete message:', messageId);
        break;
      case 'pin':
        console.log('Pin message:', messageId);
        break;
    }
  };

  const initiateCall = async (callType: 'audio' | 'video') => {
    if (!conversation?.other_user || !user) return;

    try {
      console.log('Initiating call:', { callType, conversationId, recipientId: conversation.other_user.id });

      // Start ringing sound for caller
      playRinging();

      // Create a dedicated channel for this specific call
      const callInitiationChannel = supabase.channel(`call-initiation-${conversationId}-${Date.now()}`);
      
      await callInitiationChannel.subscribe();
      
      // Send call notification to the recipient with enhanced payload
      const callPayload = {
        caller_id: user.id,
        caller_name: user.user_metadata?.display_name || user.email,
        caller_avatar: user.user_metadata?.avatar_url,
        call_type: callType,
        conversation_id: conversationId,
        recipient_id: conversation.other_user.id,
        timestamp: new Date().toISOString()
      };

      console.log('Sending call notification with payload:', callPayload);

      callInitiationChannel.send({
        type: 'broadcast',
        event: 'incoming-call',
        payload: callPayload
      });

      // Also try sending on the main call channel
      if (callChannelRef.current) {
        callChannelRef.current.send({
          type: 'broadcast',
          event: 'incoming-call',
          payload: callPayload
        });
      }

      console.log('Call notification sent');

      // Start the call immediately for the caller
      setTimeout(() => {
        stopRinging();
        if (callType === 'video') {
          setIsVideoCallActive(true);
        } else {
          setIsAudioCallActive(true);
        }
      }, 2000); // Wait 2 seconds before stopping ringing

      // Record the call attempt
      setTimeout(async () => {
        try {
          await supabase.from('call_history').insert({
            caller_id: user.id,
            recipient_id: conversation.other_user!.id,
            conversation_id: conversationId,
            call_type: callType,
            call_status: 'initiated',
            duration_seconds: 0,
            started_at: new Date().toISOString(),
            ended_at: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error recording call:', error);
        }
      }, 1000);

      // Clean up the initiation channel after some time
      setTimeout(() => {
        supabase.removeChannel(callInitiationChannel);
      }, 30000);

    } catch (error) {
      console.error('Error initiating call:', error);
      stopRinging();
      toast({
        title: "Call failed",
        description: "Could not initiate the call",
        variant: "destructive"
      });
    }
  };

  const handleVideoCall = () => initiateCall('video');
  const handleAudioCall = () => initiateCall('audio');

  const handleCallEnd = () => {
    stopRinging();
    playEndCall();
    setIsVideoCallActive(false);
    setIsAudioCallActive(false);
    
    // Notify other user that call ended
    if (callChannelRef.current) {
      callChannelRef.current.send({
        type: 'broadcast',
        event: 'call-ended',
        payload: {
          conversation_id: conversationId,
          from: user?.id,
          to: conversation?.other_user?.id
        }
      });
    }
  };

  const handleAcceptIncomingCall = () => {
    console.log('Accepting incoming call');
    stopRinging();
    playConnect();
    
    if (incomingCall?.callType === 'video') {
      setIsVideoCallActive(true);
    } else {
      setIsAudioCallActive(true);
    }
    setIncomingCall(null);
  };

  const handleDeclineIncomingCall = async () => {
    console.log('Declining incoming call');
    stopRinging();
    
    if (incomingCall && user) {
      // Record the declined call
      try {
        await supabase.from('call_history').insert({
          caller_id: incomingCall.callerId,
          recipient_id: user.id,
          conversation_id: conversationId,
          call_type: incomingCall.callType,
          call_status: 'declined',
          duration_seconds: 0,
          started_at: new Date().toISOString(),
          ended_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error recording declined call:', error);
      }
      
      // Notify caller that call was declined
      if (callChannelRef.current) {
        callChannelRef.current.send({
          type: 'broadcast',
          event: 'call-ended',
          payload: {
            conversation_id: conversationId,
            from: user.id,
            to: incomingCall.callerId,
            reason: 'declined'
          }
        });
      }
    }
    setIncomingCall(null);
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

  // Video call overlay
  if (isVideoCallActive) {
    return (
      <VideoCall
        conversationId={conversationId}
        otherUserId={conversation.other_user?.id || ''}
        onCallEnd={handleCallEnd}
      />
    );
  }

  // Audio call overlay
  if (isAudioCallActive) {
    return (
      <EnhancedAudioCall
        conversationId={conversationId}
        otherUserId={conversation.other_user?.id || ''}
        otherUserName={conversation.other_user?.display_name || conversation.other_user?.username || 'Unknown'}
        otherUserAvatar={conversation.other_user?.avatar_url}
        onCallEnd={handleCallEnd}
      />
    );
  }

  // Check if other user is typing
  const otherUserId = conversation.participant_1 === user?.id ? conversation.participant_2 : conversation.participant_1;
  const isOtherUserTyping = typingUsers[otherUserId];

  // Filter messages for this conversation with better debugging
  const conversationMessages = messages.filter(msg => {
    const participant1 = conversation.participant_1;
    const participant2 = conversation.participant_2;
    
    const belongsToConversation = (
      (msg.sender_id === participant1 && msg.recipient_id === participant2) ||
      (msg.sender_id === participant2 && msg.recipient_id === participant1)
    );
    
    return belongsToConversation;
  });

  console.log('MessageThread Debug Info:', {
    conversationId,
    participants: [conversation.participant_1, conversation.participant_2],
    totalMessages: messages.length,
    filteredMessages: conversationMessages.length,
    messagesPreview: conversationMessages.slice(-3).map(m => ({ id: m.id, content: m.content.substring(0, 50) }))
  });

  return (
    <div className="flex flex-col h-full">
      {/* Incoming call popup */}
      {incomingCall && (
        <IncomingCallPopup
          callerName={incomingCall.callerName}
          callerAvatar={incomingCall.callerAvatar}
          callType={incomingCall.callType}
          onAccept={handleAcceptIncomingCall}
          onDecline={handleDeclineIncomingCall}
          isVisible={!!incomingCall}
        />
      )}

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
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  {conversation.other_user?.display_name || conversation.other_user?.username || 'Unknown User'}
                </h2>
                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                  <Zap className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-yellow-700 dark:text-yellow-300 text-xs font-medium">
                    {conversation.streak_count || 0}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                {isOtherUserTyping ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="rounded-full" onClick={handleAudioCall}>
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={handleVideoCall}>
              <Video className="w-4 h-4" />
            </Button>
            <GroupCallDialog participants={[conversation.other_user!].filter(Boolean)} />
            <CallHistoryDialog />
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <Settings className="w-4 h-4" />
                </Button>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>
                  <Info className="w-4 h-4 mr-2" />
                  Conversation Info
                </ContextMenuItem>
                <ContextMenuItem>
                  <Pin className="w-4 h-4 mr-2" />
                  Pin Conversation
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem className="text-red-600">
                  <Delete className="w-4 h-4 mr-2" />
                  Delete Conversation
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <Button variant="ghost" size="sm" className="rounded-full">
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/20 to-pink-50/20 dark:from-purple-900/10 dark:to-pink-900/10">
        {conversationMessages.length > 0 ? (
          conversationMessages.map((message, index) => {
            const isOwnMessage = message.sender_id === user?.id;
            const showAvatar = index === 0 || conversationMessages[index - 1]?.sender_id !== message.sender_id;

            return (
              <ContextMenu key={message.id}>
                <ContextMenuTrigger asChild>
                  <div
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
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => handleMessageAction('copy', message.id, message.content)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Message
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleMessageAction('reply', message.id, message.content)}>
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleMessageAction('forward', message.id, message.content)}>
                    <Forward className="w-4 h-4 mr-2" />
                    Forward
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleMessageAction('pin', message.id, message.content)}>
                    <Pin className="w-4 h-4 mr-2" />
                    Pin Message
                  </ContextMenuItem>
                  {isOwnMessage && (
                    <>
                      <ContextMenuSeparator />
                      <ContextMenuItem 
                        onClick={() => handleMessageAction('delete', message.id, message.content)}
                        className="text-red-600"
                      >
                        <Delete className="w-4 h-4 mr-2" />
                        Delete Message
                      </ContextMenuItem>
                    </>
                  )}
                </ContextMenuContent>
              </ContextMenu>
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
            selectedDocuments={selectedDocuments}
            onImagesChange={setSelectedImages}
            onVideosChange={setSelectedVideos}
            onDocumentsChange={setSelectedDocuments}
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
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && selectedImages.length === 0 && selectedVideos.length === 0 && selectedDocuments.length === 0) || isSending}
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
