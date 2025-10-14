import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CallWebRTCSignalingClient, type CallSignalingMessage } from '@/utils/callWebRTCSignaling';
import { WebRTCPeerConnection } from '@/utils/webrtcPeerConnection';
import { useToast } from '@/hooks/use-toast';

interface UseDirectWebRTCCallOptions {
  conversationId: string;
  callType: 'audio' | 'video';
  onCallEnd?: () => void;
}

export const useDirectWebRTCCall = ({ conversationId, callType, onCallEnd }: UseDirectWebRTCCallOptions) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isInCall, setIsInCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  
  const signalingClientRef = useRef<CallWebRTCSignalingClient | null>(null);
  const peerConnectionRef = useRef<WebRTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const isStartingRef = useRef(false);
  const hasStartedRef = useRef(false);

  const createPeerConnection = useCallback(async (peerId: string, isInitiator: boolean) => {
    if (!user) return;

    console.log('[DirectWebRTC] Creating peer connection, isInitiator:', isInitiator);

    const pc = new WebRTCPeerConnection(peerId);
    await pc.initialize();

    // Set up ICE candidate handler
    pc.onIceCandidate((candidate) => {
      console.log('[DirectWebRTC] Sending ICE candidate');
      signalingClientRef.current?.sendMessage({
        type: 'ice-candidate',
        peerId,
        data: candidate
      });
    });

    // Set up remote track handler
    pc.onTrack((stream) => {
      console.log('[DirectWebRTC] Received remote stream');
      setRemoteStream(stream);
    });

    // Set up connection state change handler
    pc.onConnectionStateChange((state) => {
      console.log('[DirectWebRTC] Connection state changed:', state);
      setConnectionState(state);

      if (state === 'failed' || state === 'closed') {
        toast({
          title: "Connection Lost",
          description: "The call connection has been lost",
          variant: "destructive"
        });
      }
    });

    // Add local stream
    if (localStreamRef.current) {
      await pc.addLocalStream(localStreamRef.current);
    }

    peerConnectionRef.current = pc;

    // Create offer if initiator
    if (isInitiator) {
      console.log('[DirectWebRTC] Creating offer');
      const offer = await pc.createOffer();
      signalingClientRef.current?.sendMessage({
        type: 'offer',
        peerId,
        data: offer
      });
    }
  }, [user, toast]);

  const handleSignalingMessage = useCallback(async (message: CallSignalingMessage) => {
    console.log('[DirectWebRTC] Handling signaling message:', message.type);

    try {
      switch (message.type) {
        case 'peer-joined':
          if (message.peerId && message.peerId !== user?.id) {
            console.log('[DirectWebRTC] Peer joined:', message.peerId);
            // Determine who should initiate based on user IDs to avoid race conditions
            const shouldInitiate = user.id < message.peerId;
            console.log('[DirectWebRTC] Should initiate:', shouldInitiate, '(my ID:', user.id, ', peer ID:', message.peerId, ')');
            await createPeerConnection(message.peerId, shouldInitiate);
          }
          break;

        case 'offer':
          if (message.peerId && message.data) {
            console.log('[DirectWebRTC] Received offer from:', message.peerId);
            
            if (!peerConnectionRef.current) {
              console.log('[DirectWebRTC] Creating peer connection to handle offer');
              await createPeerConnection(message.peerId, false);
            }

            console.log('[DirectWebRTC] Setting remote description and creating answer');
            await peerConnectionRef.current?.setRemoteDescription(message.data);
            const answer = await peerConnectionRef.current?.createAnswer(); // createAnswer already sets local description
            
            console.log('[DirectWebRTC] Sending answer to:', message.peerId);
            signalingClientRef.current?.sendMessage({
              type: 'answer',
              peerId: message.peerId,
              data: answer
            });
          }
          break;

        case 'answer':
          if (message.data) {
            console.log('[DirectWebRTC] Received answer, setting remote description');
            await peerConnectionRef.current?.setRemoteDescription(message.data);
            console.log('[DirectWebRTC] Answer processed, connection should establish');
            
            // Show success toast when answer is received
            toast({
              title: "Connecting...",
              description: "Establishing secure connection"
            });
          }
          break;

        case 'ice-candidate':
          if (message.data) {
            console.log('[DirectWebRTC] Received ICE candidate');
            await peerConnectionRef.current?.addIceCandidate(message.data);
          }
          break;

        case 'peer-left':
          console.log('[DirectWebRTC] Peer left');
          toast({
            title: "Call Ended",
            description: "The other participant has left the call"
          });
          endCall();
          break;
      }
    } catch (error) {
      console.error('[DirectWebRTC] Error handling signaling message:', error);
      toast({
        title: "Connection Error",
        description: "Failed to establish connection",
        variant: "destructive"
      });
    }
  }, [user?.id, createPeerConnection, toast]);

  const startCall = useCallback(async () => {
    if (!user) return;

    // Prevent multiple simultaneous starts
    if (isStartingRef.current || hasStartedRef.current) {
      console.log('[DirectWebRTC] Call already starting or started, skipping');
      return;
    }

    try {
      console.log('[DirectWebRTC] Starting call');
      isStartingRef.current = true;
      hasStartedRef.current = true;
      setIsInCall(true);

      // Get user media
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);

      // Connect to signaling server
      const signalingClient = new CallWebRTCSignalingClient(conversationId, user.id);
      signalingClientRef.current = signalingClient;

      signalingClient.onMessage(handleSignalingMessage);
      await signalingClient.connect();

      console.log('[DirectWebRTC] Call started successfully');
      isStartingRef.current = false;
    } catch (error) {
      console.error('[DirectWebRTC] Error starting call:', error);
      isStartingRef.current = false;
      hasStartedRef.current = false;
      setIsInCall(false);
      
      let errorMessage = 'Failed to start call';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera/microphone access denied';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera or microphone found';
        }
      }

      toast({
        title: "Call Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [user, conversationId, callType, handleSignalingMessage, toast]);

  const endCall = useCallback(() => {
    console.log('[DirectWebRTC] Ending call');

    // Reset start guards
    isStartingRef.current = false;
    hasStartedRef.current = false;

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Disconnect signaling
    if (signalingClientRef.current) {
      signalingClientRef.current.disconnect();
      signalingClientRef.current = null;
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsInCall(false);
    setConnectionState('closed');

    if (onCallEnd) {
      onCallEnd();
    }
  }, [onCallEnd]);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(prev => !prev);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current && callType === 'video') {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(prev => !prev);
    }
  }, [callType]);

  // Monitor connection state for toast notifications
  useEffect(() => {
    if (connectionState === 'connected') {
      toast({
        title: "Call Connected",
        description: "You are now in a call",
        duration: 3000
      });
    } else if (connectionState === 'failed') {
      toast({
        title: "Connection Failed",
        description: "Unable to establish call connection",
        variant: "destructive"
      });
    } else if (connectionState === 'disconnected') {
      toast({
        title: "Call Disconnected",
        description: "The call has been disconnected"
      });
    }
  }, [connectionState, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    isInCall,
    localStream,
    remoteStream,
    connectionState,
    isAudioEnabled,
    isVideoEnabled,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo
  };
};
