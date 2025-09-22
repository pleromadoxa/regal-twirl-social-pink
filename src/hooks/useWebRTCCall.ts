import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getMobileBrowserInfo, getMobileOptimizedConstraints } from '@/utils/mobileWebRTC';

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
  const { user } = useAuth();
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
    error: null
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
    if (!user) return;
    
    // Prevent multiple initializations
    if (isInitializingRef.current || webrtcServiceRef.current) {
      console.log('[useWebRTCCall] Call already initializing or active');
      return;
    }

    try {
      console.log('[useWebRTCCall] Initializing call');
      isInitializingRef.current = true;
      updateCallState({ status: 'connecting', error: null });

      // Initialize WebRTC service
      const { WebRTCService } = await import('@/services/webrtcService');
      webrtcServiceRef.current = new WebRTCService();

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
    
    if (webrtcServiceRef.current) {
      // Properly cleanup the WebRTC service
      webrtcServiceRef.current.cleanup();
      webrtcServiceRef.current = null;
    }

    updateCallState({ 
      status: 'ended',
      localStream: null,
      remoteStream: null
    });

    if (onCallEnd) {
      onCallEnd();
    }
  }, [stopDurationTimer, updateCallState, onCallEnd]);

  const toggleAudio = useCallback(() => {
    if (webrtcServiceRef.current) {
      const newState = !callState.isAudioEnabled;
      webrtcServiceRef.current.toggleAudio(newState);
      updateCallState({ isAudioEnabled: newState });
      
      const browserInfo = getMobileBrowserInfo();
      
      toast({
        title: newState ? "Microphone enabled" : "Microphone disabled",
        description: newState 
          ? (browserInfo.isMobile ? "You can now be heard on mobile" : "You can now be heard")
          : (browserInfo.isMobile ? "You are muted on mobile" : "You are now muted")
      });
    }
  }, [callState.isAudioEnabled, updateCallState, toast]);

  const toggleVideo = useCallback(() => {
    if (callType === 'audio') {
      toast({
        title: "Video not available",
        description: "This is an audio-only call",
        variant: "destructive"
      });
      return;
    }

    if (webrtcServiceRef.current) {
      const newState = !callState.isVideoEnabled;
      webrtcServiceRef.current.toggleVideo(newState);
      updateCallState({ isVideoEnabled: newState });
      
      const browserInfo = getMobileBrowserInfo();
      
      toast({
        title: newState ? "Camera enabled" : "Camera disabled", 
        description: newState 
          ? (browserInfo.isMobile ? "Your video is visible on mobile" : "Your video is now visible")
          : (browserInfo.isMobile ? "Your video is hidden on mobile" : "Your video is now hidden")
      });
    }
  }, [callState.isVideoEnabled, callType, updateCallState, toast]);

  useEffect(() => {
    // Only setup tracking, don't auto-initialize
    if (user && conversationId && otherUserId) {
      console.log('[useWebRTCCall] Dependencies ready for call initialization');
    }

    return () => {
      console.log('[useWebRTCCall] Cleaning up on unmount or dependency change');
      isInitializingRef.current = false;
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.cleanup();
        webrtcServiceRef.current = null;
      }
      stopDurationTimer();
    };
  }, [user, conversationId, otherUserId, stopDurationTimer]);

  return {
    callState,
    endCall,
    toggleAudio,
    toggleVideo,
    initializeCall
  };
};
