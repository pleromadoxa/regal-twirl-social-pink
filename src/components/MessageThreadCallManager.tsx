
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createCall } from '@/services/callService';

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
  const { toast } = useToast();

  const initiateCall = async (callType: 'audio' | 'video') => {
    try {
      // Check WebRTC support first
      const { checkWebRTCSupport } = await import('@/services/callService');
      const { supported, missing } = checkWebRTCSupport();
      
      if (!supported) {
        toast({
          title: "Call not supported",
          description: `Missing: ${missing.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      // Check microphone and camera permissions
      try {
        const constraints = {
          audio: true,
          video: callType === 'video'
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
        
        // Get caller profile info
        const { data: callerProfile } = await supabase
          .from('profiles')
          .select('display_name, username, avatar_url')
          .eq('id', currentUserId)
          .single();

        // Create call in database and get call details
        const call = await createCall(currentUserId!, callType, [otherParticipant.id]);
        
        // Broadcast call invitation directly to the other participant's channel
        const recipientChannel = supabase.channel(`user-calls-${otherParticipant.id}`);
        
        await recipientChannel.send({
          type: 'broadcast',
          event: 'incoming-call',
          payload: {
            call_id: call.id,
            room_id: call.room_id,
            caller_id: currentUserId,
            call_type: callType,
            caller_profile: {
              display_name: callerProfile?.display_name || callerProfile?.username || 'Unknown User',
              username: callerProfile?.username || 'unknown',
              avatar_url: callerProfile?.avatar_url || null
            }
          }
        });

        // Subscribe to channel to listen for call responses
        recipientChannel.subscribe();
        
        // Start the call on our end
        onCallStart(callType);
        
        toast({
          title: "Calling...",
          description: `${callType === 'video' ? 'Video' : 'Audio'} call to ${otherParticipant.display_name || otherParticipant.username}`
        });
        
        // Clean up channel after some time
        setTimeout(() => {
          try {
            supabase.removeChannel(recipientChannel);
          } catch (error) {
            console.error('Error cleaning up call channel:', error);
          }
        }, 60000); // Clean up after 1 minute
        
      } catch (permissionError) {
        console.error('Permission error:', permissionError);
        
        let errorMessage = 'Permission denied';
        let errorTitle = 'Permission Required';
        
        if (permissionError instanceof Error) {
          if (permissionError.name === 'NotAllowedError') {
            errorMessage = `Please allow access to your ${callType === 'video' ? 'camera and microphone' : 'microphone'} in your browser settings and try again.`;
          } else if (permissionError.name === 'NotFoundError') {
            errorTitle = 'Device Not Found';
            errorMessage = `No ${callType === 'video' ? 'camera or microphone' : 'microphone'} found. Please check your device connections.`;
          } else {
            errorMessage = permissionError.message || `Unable to access ${callType === 'video' ? 'camera and microphone' : 'microphone'}`;
          }
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error initiating call:', error);
      toast({
        title: "Call failed",
        description: "Failed to start call. Please try again.",
        variant: "destructive"
      });
    }
  };

  return <>{children(initiateCall)}</>;
};

export default MessageThreadCallManager;
