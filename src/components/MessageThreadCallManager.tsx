
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VideoCall from './VideoCall';
import EnhancedAudioCall from './EnhancedAudioCall';

interface CallState {
  type: 'audio' | 'video';
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
}

interface MessageThreadCallManagerProps {
  conversationId: string;
  currentUserId?: string;
  otherParticipant: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  onCallStart: (type: 'audio' | 'video') => void;
  children: (initiateCall: (type: 'audio' | 'video') => void) => React.ReactNode;
}

const MessageThreadCallManager = ({ 
  conversationId, 
  currentUserId, 
  otherParticipant, 
  onCallStart,
  children 
}: MessageThreadCallManagerProps) => {
  const [activeCall, setActiveCall] = useState<CallState | null>(null);
  const { toast } = useToast();

  const initiateCall = async (callType: 'audio' | 'video') => {
    if (!currentUserId || !otherParticipant) {
      toast({
        title: "Error",
        description: "Cannot start call",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create call record
      const { data: callData, error } = await supabase
        .from('active_calls')
        .insert({
          caller_id: currentUserId,
          call_type: callType,
          participants: [currentUserId, otherParticipant.id],
          room_id: `call-${Date.now()}-${currentUserId}`
        })
        .select()
        .single();

      if (error) throw error;

      setActiveCall({
        type: callType,
        otherUserId: otherParticipant.id,
        otherUserName: otherParticipant.display_name || otherParticipant.username,
        otherUserAvatar: otherParticipant.avatar_url
      });

      onCallStart(callType);

      toast({
        title: `${callType === 'video' ? 'Video' : 'Audio'} call started`,
        description: `Calling ${otherParticipant.display_name || otherParticipant.username}...`
      });
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: "Failed to start call",
        variant: "destructive"
      });
    }
  };

  const endCall = () => {
    setActiveCall(null);
  };

  // Render active call
  if (activeCall) {
    if (activeCall.type === 'video') {
      return (
        <VideoCall
          conversationId={conversationId}
          otherUserId={activeCall.otherUserId}
          otherUserName={activeCall.otherUserName}
          otherUserAvatar={activeCall.otherUserAvatar}
          onCallEnd={endCall}
        />
      );
    } else {
      return (
        <EnhancedAudioCall
          conversationId={conversationId}
          otherUserId={activeCall.otherUserId}
          otherUserName={activeCall.otherUserName}
          otherUserAvatar={activeCall.otherUserAvatar}
          onCallEnd={endCall}
        />
      );
    }
  }

  return <>{children(initiateCall)}</>;
};

export default MessageThreadCallManager;
