import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WebRTCService } from '@/services/webrtcService';
import { getMobileBrowserInfo, getMobileOptimizedConstraints } from '@/utils/mobileWebRTC';

export interface CircleCallState {
  status: 'idle' | 'connecting' | 'connected' | 'ended' | 'failed';
  duration: number;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: Map<string, { id: string; display_name: string; username: string; avatar_url: string | null }>;
  isAudioEnabled: boolean;
  error: string | null;
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
}

export interface UseCircleCallOptions {
  roomId: string;
  circleId: string;
  callType: 'audio' | 'video';
  onCallEnd?: () => void;
}

export const useCircleCall = ({ roomId, circleId, callType, onCallEnd }: UseCircleCallOptions) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [callState, setCallState] = useState<CircleCallState>({
    status: 'idle',
    duration: 0,
    localStream: null,
    remoteStreams: new Map(),
    participants: new Map(),
    isAudioEnabled: true,
    error: null,
    networkQuality: 'disconnected'
  });

  const updateCallState = useCallback((updates: Partial<CircleCallState>) => {
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
      console.error('[useCircleCall] No authenticated user');
      return;
    }

    try {
      console.log('[useCircleCall] Initializing circle call for room:', roomId);
      updateCallState({ status: 'connecting', error: null });

      // Initialize WebRTC service
      webrtcServiceRef.current = new WebRTCService();
      const service = webrtcServiceRef.current;

      // Set up callbacks
      service.onLocalStream((stream) => {
        console.log('[useCircleCall] Local stream received');
        updateCallState({ localStream: stream });
      });

      service.onRemoteStream((stream) => {
        console.log('[useCircleCall] Remote stream received');
        setCallState(prev => {
          const newRemoteStreams = new Map(prev.remoteStreams);
          newRemoteStreams.set('remote', stream);
          return { ...prev, remoteStreams: newRemoteStreams };
        });
      });

      service.onConnectionStateChange((state) => {
        console.log('[useCircleCall] Connection state:', state);
        if (state === 'connected') {
          updateCallState({ status: 'connected', error: null });
          startDurationTimer();
        } else if (state === 'failed') {
          updateCallState({ 
            status: 'failed', 
            error: 'Connection failed. Please check your internet connection.' 
          });
        } else if (state === 'connecting') {
          updateCallState({ status: 'connecting' });
        }
      });

      service.onNetworkQuality((quality) => {
        updateCallState({ networkQuality: quality });
        if (quality === 'poor' || quality === 'disconnected') {
          updateCallState({ 
            error: 'Poor network connection. Call quality may be affected.' 
          });
        }
      });

      service.onError((error) => {
        console.error('[useCircleCall] WebRTC error:', error);
        updateCallState({ status: 'failed', error: error.message });
        toast({
          title: "Call Error",
          description: error.message,
          variant: "destructive"
        });
      });

      // Get media constraints
      const browserInfo = getMobileBrowserInfo();
      const constraints = getMobileOptimizedConstraints(callType, browserInfo);

      // Initialize media
      const localStream = await service.initializeMedia(constraints);
      console.log('[useCircleCall] Local stream initialized');

      // Initialize peer connection
      service.initializePeerConnection();
      await service.addLocalStream(localStream);

      // Setup signaling for the circle call room
      service.setupSignaling(`call-${roomId}`, user.id);

      // Create offer to start the call
      await service.createOffer();

      console.log('[useCircleCall] Call initialization complete');

    } catch (error) {
      console.error('[useCircleCall] Error initializing call:', error);
      
      let errorMessage = 'Failed to initialize call';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Please allow microphone access to join the call';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please check your device.';
        } else {
          errorMessage = error.message;
        }
      }

      updateCallState({ status: 'failed', error: errorMessage });
      toast({
        title: "Call Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [user, roomId, callType, updateCallState, startDurationTimer, toast]);

  const endCall = useCallback(async () => {
    console.log('[useCircleCall] Ending call');
    
    stopDurationTimer();

    if (webrtcServiceRef.current) {
      webrtcServiceRef.current.cleanup();
      webrtcServiceRef.current = null;
    }

    updateCallState({
      status: 'ended',
      localStream: null,
      remoteStreams: new Map(),
      error: null,
      networkQuality: 'disconnected'
    });

    if (onCallEnd) {
      onCallEnd();
    }
  }, [stopDurationTimer, updateCallState, onCallEnd]);

  const toggleAudio = useCallback(() => {
    if (webrtcServiceRef.current && callState.localStream) {
      const newState = !callState.isAudioEnabled;
      
      callState.localStream.getAudioTracks().forEach(track => {
        track.enabled = newState;
      });

      webrtcServiceRef.current.toggleAudio(newState);
      updateCallState({ isAudioEnabled: newState });

      toast({
        title: newState ? "Microphone enabled" : "Microphone disabled",
        duration: 2000
      });
    }
  }, [callState.isAudioEnabled, callState.localStream, updateCallState, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.cleanup();
      }
      stopDurationTimer();
    };
  }, [stopDurationTimer]);

  return {
    callState,
    initializeCall,
    endCall,
    toggleAudio
  };
};
