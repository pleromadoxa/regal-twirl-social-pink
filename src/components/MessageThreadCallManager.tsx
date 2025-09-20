
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createCall, checkWebRTCSupport } from '@/services/callService';
import { getMobileBrowserInfo } from '@/utils/mobileWebRTC';

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
      // Enhanced WebRTC support check with mobile compatibility
      const { supported, missing, warnings } = checkWebRTCSupport();
      const browserInfo = getMobileBrowserInfo();
      
      console.log('[CallManager] Browser info:', browserInfo);
      console.log('[CallManager] WebRTC support:', { supported, missing, warnings });
      
      if (!supported) {
        let errorDescription = `Missing: ${missing.join(', ')}`;
        
        if (browserInfo.isMobile) {
          if (browserInfo.isIOS && browserInfo.version < 11) {
            errorDescription = 'Please update to iOS Safari 11+ for video calling support.';
          } else if (browserInfo.isAndroid && browserInfo.version < 56) {
            errorDescription = 'Please update to Chrome 56+ for reliable mobile calling.';
          } else {
            errorDescription = `Video calling not supported on your ${browserInfo.isIOS ? 'iOS' : 'Android'} browser version.`;
          }
        }
        
        toast({
          title: "Call not supported",
          description: errorDescription,
          variant: "destructive"
        });
        return;
      }

      // Show warnings for mobile users
      if (browserInfo.isMobile && warnings.length > 0) {
        console.log('[CallManager] Mobile warnings:', warnings);
        toast({
          title: "Mobile Call Notice",
          description: warnings.join('. '),
          variant: "default"
        });
      }

      // Enhanced permission request for mobile devices
      try {
        const constraints: MediaStreamConstraints = {
          audio: true,
          video: callType === 'video'
        };
        
        // Mobile-specific constraints
        if (browserInfo.isMobile) {
          if (constraints.audio) {
            constraints.audio = {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 16000, // Optimized for mobile
              channelCount: 1
            } as MediaTrackConstraints;
          }
          
          if (constraints.video && callType === 'video') {
            constraints.video = {
              width: { ideal: browserInfo.isIOS ? 480 : 640, max: 1280 },
              height: { ideal: browserInfo.isIOS ? 360 : 480, max: 720 },
              frameRate: { ideal: 15, max: browserInfo.isIOS ? 24 : 30 },
              facingMode: 'user'
            } as MediaTrackConstraints;
          }
        }
        
        console.log('[CallManager] Testing media permissions with constraints:', constraints);
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
        
        console.log('[CallManager] Media permissions granted successfully');
        
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
            },
            mobile_optimized: browserInfo.isMobile // Flag for mobile optimization
          }
        });

        // Subscribe to channel to listen for call responses
        recipientChannel.subscribe();
        
        // Start the call on our end
        onCallStart(callType);
        
        const callDescription = browserInfo.isMobile 
          ? `${callType === 'video' ? 'Video' : 'Audio'} call to ${otherParticipant.display_name || otherParticipant.username} (mobile optimized)`
          : `${callType === 'video' ? 'Video' : 'Audio'} call to ${otherParticipant.display_name || otherParticipant.username}`;
        
        toast({
          title: "Calling...",
          description: callDescription
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
            errorTitle = 'Permission Denied';
            if (browserInfo.isMobile) {
              errorMessage = `Please allow camera/microphone access in your ${browserInfo.isIOS ? 'iOS Safari' : 'Android browser'} settings. You may need to refresh the page after granting permissions.`;
            } else {
              errorMessage = `Please allow access to your ${callType === 'video' ? 'camera and microphone' : 'microphone'} in your browser settings and try again.`;
            }
          } else if (permissionError.name === 'NotFoundError') {
            errorTitle = 'Device Not Found';
            errorMessage = browserInfo.isMobile
              ? 'No camera or microphone found on your mobile device. Please check your device hardware.'
              : `No ${callType === 'video' ? 'camera or microphone' : 'microphone'} found. Please check your device connections.`;
          } else if (permissionError.name === 'NotReadableError') {
            errorTitle = 'Device In Use';
            errorMessage = browserInfo.isMobile
              ? 'Your camera or microphone is being used by another app. Please close other apps and try again.'
              : `Your ${callType === 'video' ? 'camera or microphone' : 'microphone'} is being used by another application.`;
          } else if (permissionError.name === 'OverconstrainedError') {
            errorTitle = 'Device Constraints';
            errorMessage = browserInfo.isMobile
              ? 'Your mobile device does not support the required call quality. Please try with a different device or update your browser.'
              : 'Your device does not support the required call settings.';
          } else {
            errorMessage = browserInfo.isMobile
              ? `Mobile call error: ${permissionError.message || 'Unable to access camera/microphone'}`
              : permissionError.message || `Unable to access ${callType === 'video' ? 'camera and microphone' : 'microphone'}`;
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
      
      const browserInfo = getMobileBrowserInfo();
      let errorDescription = "Failed to start call. Please try again.";
      
      if (browserInfo.isMobile) {
        errorDescription = "Failed to start mobile call. Please check your connection and try again.";
      }
      
      toast({
        title: "Call failed",
        description: errorDescription,
        variant: "destructive"
      });
    }
  };

  return <>{children(initiateCall)}</>;
};

export default MessageThreadCallManager;
