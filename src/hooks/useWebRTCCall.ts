import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

    try {
      console.log('[useWebRTCCall] Initializing call');
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
          updateCallState({ status: 'connected' });
          startDurationTimer();
        } else if (state === 'failed' || state === 'disconnected') {
          updateCallState({ status: 'failed', error: 'Connection failed' });
        }
      });

      service.onIceConnectionStateChange((state) => {
        updateCallState({ iceConnectionState: state });
      });

      service.onError((error) => {
        updateCallState({ status: 'failed', error: error.message });
        toast({
          title: "Call Error",
          description: error.message,
          variant: "destructive"
        });
      });

      // Initialize media
      const constraints = {
        audio: true,
        video: callType === 'video'
      };

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

    } catch (error) {
      console.error('[useWebRTCCall] Error initializing call:', error);
      updateCallState({ 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Failed to initialize call'
      });
      
      toast({
        title: "Call Failed",
        description: "Failed to initialize call. Please check your camera and microphone permissions.",
        variant: "destructive"
      });
    }
  }, [callType, conversationId, isIncoming, updateCallState, startDurationTimer, toast, user]);

  const endCall = useCallback(async () => {
    console.log('[useWebRTCCall] Ending call');
    
    stopDurationTimer();
    
    if (webrtcServiceRef.current) {
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
      
      toast({
        title: newState ? "Microphone enabled" : "Microphone disabled",
        description: newState ? "You can now be heard" : "You are now muted"
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
      
      toast({
        title: newState ? "Camera enabled" : "Camera disabled", 
        description: newState ? "Your video is now visible" : "Your video is now hidden"
      });
    }
  }, [callState.isVideoEnabled, callType, updateCallState, toast]);

  useEffect(() => {
    if (user && conversationId && otherUserId) {
      // Placeholder - no initialization
    }

    return () => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current = null;
      }
      stopDurationTimer();
    };
  }, [user, conversationId, otherUserId, initializeCall, stopDurationTimer]);

  return {
    callState,
    endCall,
    toggleAudio,
    toggleVideo,
    initializeCall
  };
};
