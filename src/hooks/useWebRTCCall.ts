
import { useState, useEffect, useCallback, useRef } from 'react';
import { WebRTCService } from '@/services/webrtcService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createCall, endCall, ActiveCall } from '@/services/callService';

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
  
  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeCallRef = useRef<ActiveCall | null>(null);

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
    if (!user) {
      console.error('[useWebRTCCall] No user available');
      return;
    }

    try {
      console.log('[useWebRTCCall] Initializing call', { callType, conversationId });
      
      updateCallState({ status: 'connecting', error: null });

      // Create call record if not incoming
      if (!isIncoming) {
        const call = await createCall(user.id, callType, [user.id, otherUserId]);
        activeCallRef.current = call;
      }
      
      const webrtcService = new WebRTCService();
      webrtcServiceRef.current = webrtcService;

      // Set up event handlers
      webrtcService.onLocalStream((stream) => {
        console.log('[useWebRTCCall] Local stream received');
        updateCallState({ localStream: stream });
      });

      webrtcService.onRemoteStream((stream) => {
        console.log('[useWebRTCCall] Remote stream received');
        updateCallState({ remoteStream: stream });
      });

      webrtcService.onConnectionStateChange((state) => {
        console.log('[useWebRTCCall] Connection state changed:', state);
        updateCallState({ connectionState: state });
        
        if (state === 'connected') {
          updateCallState({ status: 'connected' });
          startDurationTimer();
        } else if (state === 'failed' || state === 'closed') {
          updateCallState({ status: 'failed', error: 'Connection failed' });
          endCallHandler();
        }
      });

      webrtcService.onIceConnectionStateChange((state) => {
        console.log('[useWebRTCCall] ICE connection state changed:', state);
        updateCallState({ iceConnectionState: state });
        
        if (state === 'failed') {
          updateCallState({ status: 'failed', error: 'Network connection failed' });
        }
      });

      webrtcService.onError((error) => {
        console.error('[useWebRTCCall] WebRTC error:', error);
        updateCallState({ 
          status: 'failed', 
          error: error.message 
        });
        
        toast({
          title: "Call Error",
          description: error.message,
          variant: "destructive"
        });
      });

      // Initialize media
      const mediaConstraints = {
        video: callType === 'video',
        audio: true
      };

      const localStream = await webrtcService.initializeMedia(mediaConstraints);
      
      // Initialize peer connection
      webrtcService.initializePeerConnection();
      
      // Add local stream
      await webrtcService.addLocalStream(localStream);

      // Setup signaling
      const channelName = `${callType}-call-${conversationId}-${Date.now()}`;
      webrtcService.setupSignaling(channelName);

      // Start call process
      if (!isIncoming) {
        console.log('[useWebRTCCall] Creating offer as initiator');
        await webrtcService.createOffer();
      }

    } catch (error) {
      console.error('[useWebRTCCall] Error initializing call:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize call';
      
      updateCallState({ 
        status: 'failed', 
        error: errorMessage 
      });
      
      toast({
        title: "Call Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [callType, conversationId, isIncoming, updateCallState, startDurationTimer, toast, user, otherUserId]);

  const endCallHandler = useCallback(async () => {
    console.log('[useWebRTCCall] Ending call');
    
    stopDurationTimer();
    
    // End call in database if we have an active call
    if (activeCallRef.current) {
      try {
        await endCall(activeCallRef.current.id);
      } catch (error) {
        console.error('[useWebRTCCall] Error ending call in database:', error);
      }
    }
    
    if (webrtcServiceRef.current) {
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
      
      toast({
        title: newState ? "Microphone enabled" : "Microphone disabled",
        description: newState ? "You are now audible" : "You are now muted"
      });
    }
  }, [callState.isAudioEnabled, updateCallState, toast]);

  const toggleVideo = useCallback(() => {
    if (webrtcServiceRef.current && callType === 'video') {
      const newState = !callState.isVideoEnabled;
      webrtcServiceRef.current.toggleVideo(newState);
      updateCallState({ isVideoEnabled: newState });
      
      toast({
        title: newState ? "Camera enabled" : "Camera disabled",
        description: newState ? "You are now visible" : "Your camera is off"
      });
    }
  }, [callState.isVideoEnabled, callType, updateCallState, toast]);

  // Initialize call on mount
  useEffect(() => {
    if (user && conversationId && otherUserId) {
      initializeCall();
    }

    return () => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.cleanup();
      }
      stopDurationTimer();
    };
  }, [user, conversationId, otherUserId, initializeCall, stopDurationTimer]);

  return {
    callState,
    endCall: endCallHandler,
    toggleAudio,
    toggleVideo,
    initializeCall
  };
};
