import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getMobileBrowserInfo, getMobileOptimizedConstraints } from '@/utils/mobileWebRTC';
import { enhancedCallService, type EnhancedCall } from '@/services/enhancedCallService';

export interface CallState {
  status: 'idle' | 'connecting' | 'connected' | 'ended' | 'failed';
  duration: number;
  connectionState: RTCPeerConnectionState | null;
  iceConnectionState: RTCIceConnectionState | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  error: string | null;
  enhancedCall: EnhancedCall | null;
  participantCount: number;
}

export interface UseWebRTCCallOptions {
  conversationId: string;
  otherUserId: string;
  callType: 'audio' | 'video';
  isIncoming?: boolean;
  onCallEnd?: () => void;
}

export const useWebRTCCall = ({
  conversationId,
  otherUserId,
  callType,
  isIncoming = false,
  onCallEnd
}: UseWebRTCCallOptions) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const webrtcServiceRef = useRef<any>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef<boolean>(false);

  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
    duration: 0,
    connectionState: null,
    iceConnectionState: null,
    isAudioEnabled: true,
    isVideoEnabled: callType === 'video',
    localStream: null,
    remoteStream: null,
    error: null,
    enhancedCall: null,
    participantCount: 0
  });

  const updateCallState = useCallback((updates: Partial<CallState>) => {
    setCallState(prev => ({ ...prev, ...updates }));
  }, []);

  const startDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    
    callStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        updateCallState({ duration: elapsed });
      }
    }, 1000);
  }, [updateCallState]);

  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const initializeCall = useCallback(async () => {
    if (!user) {
      console.error('[useWebRTCCall] No authenticated user');
      updateCallState({ 
        status: 'failed', 
        error: 'Authentication required for calls' 
      });
      return;
    }
    
    // Prevent multiple initializations
    if (isInitializingRef.current || webrtcServiceRef.current) {
      console.log('[useWebRTCCall] Call already initializing or active');
      return;
    }

    try {
      console.log('[useWebRTCCall] Initializing call for user:', user.id);
      isInitializingRef.current = true;
      updateCallState({ status: 'connecting', error: null });

      // Start enhanced call service
      const enhancedCall = await enhancedCallService.startCall(
        callType,
        user.id,
        [otherUserId],
        {
          display_name: profile?.display_name,
          username: profile?.username,
          avatar_url: profile?.avatar_url
        }
      );

      updateCallState({ enhancedCall, participantCount: enhancedCall.participants.length });

      // Test connection first
      console.log('[useWebRTCCall] Testing connection prerequisites...');
      
      // Initialize WebRTC service
      const { WebRTCService } = await import('@/services/webrtcService');
      webrtcServiceRef.current = new WebRTCService();

      console.log('[useWebRTCCall] WebRTC service created successfully');

      const service = webrtcServiceRef.current;

      // Set up callbacks
      service.onLocalStream((stream) => {
        updateCallState({ localStream: stream });
      });

      service.onRemoteStream((stream) => {
        updateCallState({ remoteStream: stream });
      });

      service.onConnectionStateChange((state) => {
        updateCallState({ connectionState: state });
        if (state === 'connected') {
          updateCallState({ status: 'connected', error: null });
          startDurationTimer();
          
          // Update enhanced call service
          if (user?.id) {
            enhancedCallService.updateParticipantStatus(user.id, 'connected');
          }
        } else if (state === 'failed') {
          // Only fail immediately on actual failures, not temporary disconnections
          updateCallState({ status: 'failed', error: 'Connection failed. Please check your internet connection and try again.' });
          toast({
            title: "Connection Lost",
            description: "The call connection has failed. This may be due to network issues.",
            variant: "destructive"
          });
        } else if (state === 'connecting') {
          updateCallState({ status: 'connecting', error: null });
          
          // Update enhanced call service
          if (user?.id) {
            enhancedCallService.updateParticipantStatus(user.id, 'connecting');
          }
        }
      });

      service.onIceConnectionStateChange((state) => {
        updateCallState({ iceConnectionState: state });
        
        // Provide user feedback on connection attempts
        if (state === 'checking') {
          updateCallState({ error: 'Establishing connection...' });
        } else if (state === 'connected' || state === 'completed') {
          updateCallState({ error: null });
        } else if (state === 'disconnected') {
          updateCallState({ error: 'Connection interrupted, attempting to reconnect...' });
        } else if (state === 'failed') {
          updateCallState({ 
            status: 'failed', 
            error: 'Unable to establish connection. This may be due to firewall or network restrictions.' 
          });
        }
      });

      service.onError((error) => {
        updateCallState({ status: 'failed', error: error.message });
        toast({
          title: "Call Error",
          description: error.message,
          variant: "destructive"
        });
      });

      // Initialize media with mobile-optimized constraints
      const browserInfo = getMobileBrowserInfo();
      const constraints = getMobileOptimizedConstraints(callType, browserInfo);
      
      console.log('[useWebRTCCall] Using mobile-optimized constraints:', constraints, 'Browser info:', browserInfo);

      const localStream = await service.initializeMedia(constraints);
      
      // Initialize peer connection
      service.initializePeerConnection();
      await service.addLocalStream(localStream);

      // Setup signaling
      service.setupSignaling(`call-${conversationId}`);

      if (!isIncoming) {
        // Create offer for outgoing calls
        await service.createOffer();
      }

      updateCallState({ status: 'connecting' });
      isInitializingRef.current = false;

    } catch (error) {
      console.error('[useWebRTCCall] Error initializing call:', error);
      isInitializingRef.current = false;
      
      let errorMessage = 'Failed to initialize call';
      let errorTitle = 'Call Failed';
      
      if (error instanceof Error) {
        const browserInfo = getMobileBrowserInfo();
        
        // Enhanced mobile-specific error handling
        if (error.name === 'NotAllowedError') {
          errorTitle = 'Camera/Microphone Access Required';
          if (browserInfo.isMobile) {
            errorMessage = `Please tap "Allow" when your browser asks for ${callType === 'video' ? 'camera and microphone' : 'microphone'} access. On ${browserInfo.isIOS ? 'iOS Safari' : 'Android Chrome'}, you may need to check Settings if the prompt doesn't appear.`;
          } else {
            errorMessage = `Please click "Allow" when your browser prompts for ${callType === 'video' ? 'camera and microphone' : 'microphone'} access, then try calling again.`;
          }
        } else if (error.name === 'NotFoundError') {
          errorTitle = 'Device Not Found';
          errorMessage = browserInfo.isMobile 
            ? 'No camera or microphone found on your mobile device. Please check your device hardware and try again.'
            : `No ${callType === 'video' ? 'camera or microphone' : 'microphone'} found. Please check your device connections.`;
        } else if (error.name === 'NotSupportedError') {
          errorTitle = 'Not Supported';
          errorMessage = browserInfo.isMobile
            ? `Your mobile browser (${browserInfo.isIOS ? 'iOS Safari' : browserInfo.isAndroid ? 'Android Chrome' : 'mobile browser'}) does not support video calling. Please try updating your browser.`
            : 'Your browser does not support the required features for calling.';
        } else if (error.name === 'NotReadableError') {
          errorTitle = 'Device In Use';
          errorMessage = browserInfo.isMobile
            ? 'Your camera or microphone is being used by another app. Please close other apps and try again.'
            : `Your ${callType === 'video' ? 'camera or microphone' : 'microphone'} is being used by another application.`;
        } else if (error.name === 'OverconstrainedError') {
          errorTitle = 'Device Constraints';
          errorMessage = browserInfo.isMobile
            ? 'Your mobile device does not support the required call quality. Trying with optimized settings...'
            : 'Your device does not support the required call settings.';
        } else {
          errorMessage = browserInfo.isMobile && error.message
            ? `Mobile call error: ${error.message}`
            : error.message || 'An unexpected error occurred';
        }
      }
      
      updateCallState({ 
        status: 'failed', 
        error: errorMessage
      });
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [callType, conversationId, isIncoming, updateCallState, startDurationTimer, toast, user]);

  const endCall = useCallback(async () => {
    console.log('[useWebRTCCall] Ending call');
    
    stopDurationTimer();
    isInitializingRef.current = false;
    
    // End enhanced call
    if (user?.id && profile) {
      await enhancedCallService.endCall(
        user.id,
        profile.display_name || profile.username || 'Unknown User'
      );
    }
    
    if (webrtcServiceRef.current) {
      // Properly cleanup the WebRTC service
      webrtcServiceRef.current.cleanup();
      webrtcServiceRef.current = null;
    }

    updateCallState({ 
      status: 'ended',
      localStream: null,
      remoteStream: null,
      enhancedCall: null,
      participantCount: 0
    });

    if (onCallEnd) {
      onCallEnd();
    }
  }, [stopDurationTimer, updateCallState, onCallEnd, user?.id, profile]);

  const toggleAudio = useCallback(() => {
    console.log('[useWebRTCCall] toggleAudio called, current state:', callState.isAudioEnabled);
    
    if (webrtcServiceRef.current && callState.localStream) {
      const newState = !callState.isAudioEnabled;
      console.log('[useWebRTCCall] Toggling audio to:', newState);
      
      try {
        // Toggle audio tracks directly
        callState.localStream.getAudioTracks().forEach(track => {
          track.enabled = newState;
          console.log('[useWebRTCCall] Audio track enabled set to:', newState);
        });
        
        // Also call service method
        webrtcServiceRef.current.toggleAudio(newState);
        
        // Update state
        updateCallState({ isAudioEnabled: newState });
        
        const browserInfo = getMobileBrowserInfo();
        
        toast({
          title: newState ? "Microphone enabled" : "Microphone disabled",
          description: newState 
            ? (browserInfo.isMobile ? "You can now be heard on mobile" : "You can now be heard")
            : (browserInfo.isMobile ? "You are muted on mobile" : "You are now muted"),
          duration: 2000
        });
        
        console.log('[useWebRTCCall] Audio toggle completed successfully');
      } catch (error) {
        console.error('[useWebRTCCall] Error toggling audio:', error);
        toast({
          title: "Audio toggle failed",
          description: "There was an error toggling your microphone",
          variant: "destructive"
        });
      }
    } else {
      console.warn('[useWebRTCCall] Cannot toggle audio - service or stream not available');
      toast({
        title: "Audio not available",
        description: "Cannot toggle microphone at this time",
        variant: "destructive"
      });
    }
  }, [callState.isAudioEnabled, callState.localStream, updateCallState, toast]);

  const toggleVideo = useCallback(() => {
    console.log('[useWebRTCCall] toggleVideo called, current state:', callState.isVideoEnabled);
    
    if (callType === 'audio') {
      toast({
        title: "Video not available",
        description: "This is an audio-only call",
        variant: "destructive"
      });
      return;
    }

    if (webrtcServiceRef.current && callState.localStream) {
      const newState = !callState.isVideoEnabled;
      console.log('[useWebRTCCall] Toggling video to:', newState);
      
      try {
        // Toggle video tracks directly
        callState.localStream.getVideoTracks().forEach(track => {
          track.enabled = newState;
          console.log('[useWebRTCCall] Video track enabled set to:', newState);
        });
        
        // Also call service method
        webrtcServiceRef.current.toggleVideo(newState);
        
        // Update state
        updateCallState({ isVideoEnabled: newState });
        
        const browserInfo = getMobileBrowserInfo();
        
        toast({
          title: newState ? "Camera enabled" : "Camera disabled", 
          description: newState 
            ? (browserInfo.isMobile ? "Your video is visible on mobile" : "Your video is now visible")
            : (browserInfo.isMobile ? "Your video is hidden on mobile" : "Your video is now hidden"),
          duration: 2000
        });
        
        console.log('[useWebRTCCall] Video toggle completed successfully');
      } catch (error) {
        console.error('[useWebRTCCall] Error toggling video:', error);
        toast({
          title: "Camera toggle failed",
          description: "There was an error toggling your camera",
          variant: "destructive"
        });
      }
    } else {
      console.warn('[useWebRTCCall] Cannot toggle video - service or stream not available');
      toast({
        title: "Camera not available",
        description: "Cannot toggle camera at this time",
        variant: "destructive"
      });
    }
  }, [callState.isVideoEnabled, callState.localStream, callType, updateCallState, toast]);

  useEffect(() => {
    // Only setup tracking, don't auto-initialize
    if (user && conversationId && otherUserId) {
      console.log('[useWebRTCCall] Dependencies ready for call initialization');
    }

    // Monitor enhanced call service for updates
    const checkCallUpdates = setInterval(() => {
      const currentCall = enhancedCallService.getCurrentCall();
      if (currentCall && currentCall !== callState.enhancedCall) {
        updateCallState({ 
          enhancedCall: currentCall,
          participantCount: currentCall.participants.length 
        });
      }
    }, 1000);

    return () => {
      console.log('[useWebRTCCall] Cleaning up on unmount or dependency change');
      clearInterval(checkCallUpdates);
      isInitializingRef.current = false;
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.cleanup();
        webrtcServiceRef.current = null;
      }
      stopDurationTimer();
    };
  }, [user, conversationId, otherUserId, stopDurationTimer, callState.enhancedCall, updateCallState]);

  return {
    callState,
    endCall,
    toggleAudio,
    toggleVideo,
    initializeCall,
    joinCall: useCallback(async (callId: string) => {
      if (!user || !profile) return;
      
      try {
        await enhancedCallService.joinCall(callId, user.id, {
          display_name: profile.display_name,
          username: profile.username,
          avatar_url: profile.avatar_url
        });
        
        const currentCall = enhancedCallService.getCurrentCall();
        if (currentCall) {
          updateCallState({ 
            enhancedCall: currentCall,
            participantCount: currentCall.participants.length 
          });
        }
      } catch (error) {
        console.error('Error joining call:', error);
        toast({
          title: "Failed to join call",
          description: "Could not join the call. It may have ended.",
          variant: "destructive"
        });
      }
    }, [user, profile, updateCallState, toast])
  };
};
