import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { WebRTCSignalingClient, SignalingMessage } from '@/utils/webrtcSignaling';
import { WebRTCPeerConnection } from '@/utils/webrtcPeerConnection';

interface PeerConnection {
  peerId: string;
  connection: WebRTCPeerConnection;
  stream?: MediaStream;
}

export const useCircleWebRTCCall = (circleId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isInCall, setIsInCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
  const [connectionStates, setConnectionStates] = useState<Map<string, RTCPeerConnectionState>>(new Map());
  
  const signalingClient = useRef<WebRTCSignalingClient | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const updateConnectionState = useCallback((peerId: string, state: RTCPeerConnectionState) => {
    setConnectionStates(prev => {
      const newStates = new Map(prev);
      newStates.set(peerId, state);
      return newStates;
    });
  }, []);

  const createPeerConnection = useCallback(async (peerId: string, isInitiator: boolean) => {
    if (!user || !localStreamRef.current) return;

    console.log(`[Call Manager] Creating peer connection for ${peerId} (initiator: ${isInitiator})`);

    const peerConnection = new WebRTCPeerConnection(peerId);
    await peerConnection.initialize();

    // Add local stream
    await peerConnection.addLocalStream(localStreamRef.current);

    // Handle ICE candidates with trickle ICE
    peerConnection.onIceCandidate((candidate) => {
      console.log(`[Call Manager] Sending ICE candidate to ${peerId}`);
      signalingClient.current?.sendMessage({
        type: 'ice-candidate',
        peerId,
        data: { candidate: candidate.toJSON() }
      });
    });

    // Handle remote tracks
    peerConnection.onTrack((stream) => {
      console.log(`[Call Manager] Received remote stream from ${peerId}`);
      setPeers(prev => {
        const newPeers = new Map(prev);
        const peer = newPeers.get(peerId);
        if (peer) {
          peer.stream = stream;
          newPeers.set(peerId, peer);
        }
        return newPeers;
      });
    });

    // Handle connection state changes
    peerConnection.onConnectionStateChange((state) => {
      console.log(`[Call Manager] Peer ${peerId} connection state: ${state}`);
      updateConnectionState(peerId, state);
      
      if (state === 'failed' || state === 'disconnected') {
        toast({
          title: "Connection Issue",
          description: `Connection with peer ${peerId} is ${state}`,
          variant: "destructive"
        });
      } else if (state === 'connected') {
        toast({
          title: "Connected",
          description: `Successfully connected to peer`,
        });
      }
    });

    // Store peer connection
    setPeers(prev => {
      const newPeers = new Map(prev);
      newPeers.set(peerId, { peerId, connection: peerConnection });
      return newPeers;
    });

    // If we're the initiator, create and send offer
    if (isInitiator) {
      const offer = await peerConnection.createOffer();
      console.log(`[Call Manager] Sending offer to ${peerId}`);
      signalingClient.current?.sendMessage({
        type: 'offer',
        peerId,
        data: { description: offer }
      });
    }

    return peerConnection;
  }, [user, toast, updateConnectionState]);

  const handleSignalingMessage = useCallback(async (message: SignalingMessage) => {
    console.log(`[Call Manager] Handling signaling message:`, message.type);

    switch (message.type) {
      case 'existing-peers':
        // Create peer connections for all existing peers
        const existingPeerIds = message.data?.peers || [];
        console.log(`[Call Manager] Connecting to ${existingPeerIds.length} existing peers`);
        
        for (const peerId of existingPeerIds) {
          await createPeerConnection(peerId, true);
        }
        break;

      case 'peer-joined':
        const newPeerId = message.data?.peerId;
        if (newPeerId && newPeerId !== user?.id) {
          console.log(`[Call Manager] New peer joined: ${newPeerId}`);
          // Don't create connection yet, wait for offer
        }
        break;

      case 'offer':
        const offerPeerId = message.peerId!;
        console.log(`[Call Manager] Received offer from ${offerPeerId}`);
        
        let peerConnection = peers.get(offerPeerId)?.connection;
        if (!peerConnection) {
          peerConnection = await createPeerConnection(offerPeerId, false);
        }
        
        if (peerConnection) {
          await peerConnection.setRemoteDescription(message.data.description);
          const answer = await peerConnection.createAnswer();
          
          console.log(`[Call Manager] Sending answer to ${offerPeerId}`);
          signalingClient.current?.sendMessage({
            type: 'answer',
            peerId: offerPeerId,
            data: { description: answer }
          });
        }
        break;

      case 'answer':
        const answerPeerId = message.peerId!;
        console.log(`[Call Manager] Received answer from ${answerPeerId}`);
        
        const answerPeerConnection = peers.get(answerPeerId)?.connection;
        if (answerPeerConnection) {
          await answerPeerConnection.setRemoteDescription(message.data.description);
        }
        break;

      case 'ice-candidate':
        const candidatePeerId = message.peerId!;
        console.log(`[Call Manager] Received ICE candidate from ${candidatePeerId}`);
        
        const candidatePeerConnection = peers.get(candidatePeerId)?.connection;
        if (candidatePeerConnection) {
          await candidatePeerConnection.addIceCandidate(message.data.candidate);
        }
        break;

      case 'peer-left':
        const leftPeerId = message.data?.peerId;
        if (leftPeerId) {
          console.log(`[Call Manager] Peer left: ${leftPeerId}`);
          const leftPeer = peers.get(leftPeerId);
          if (leftPeer) {
            leftPeer.connection.close();
            setPeers(prev => {
              const newPeers = new Map(prev);
              newPeers.delete(leftPeerId);
              return newPeers;
            });
            setConnectionStates(prev => {
              const newStates = new Map(prev);
              newStates.delete(leftPeerId);
              return newStates;
            });
          }
        }
        break;
    }
  }, [user, peers, createPeerConnection]);

  const startCall = useCallback(async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to start a call",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('[Call Manager] Starting call...');
      
      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      console.log('[Call Manager] Got local media stream');
      localStreamRef.current = stream;
      setLocalStream(stream);

      // Connect to signaling server
      signalingClient.current = new WebRTCSignalingClient(circleId, user.id);
      signalingClient.current.onMessage(handleSignalingMessage);
      
      await signalingClient.current.connect();
      console.log('[Call Manager] Connected to signaling server');

      setIsInCall(true);
      
      toast({
        title: "Call Started",
        description: "You're now in the circle call",
      });
    } catch (error) {
      console.error('[Call Manager] Error starting call:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start call",
        variant: "destructive"
      });
      
      // Cleanup on error
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      }
    }
  }, [user, circleId, toast, handleSignalingMessage]);

  const endCall = useCallback(() => {
    console.log('[Call Manager] Ending call...');

    // Close all peer connections
    peers.forEach(peer => {
      peer.connection.close();
    });
    setPeers(new Map());
    setConnectionStates(new Map());

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // Disconnect signaling
    signalingClient.current?.disconnect();
    signalingClient.current = null;

    setIsInCall(false);

    toast({
      title: "Call Ended",
      description: "You've left the circle call",
    });
  }, [peers, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInCall) {
        endCall();
      }
    };
  }, [isInCall, endCall]);

  return {
    isInCall,
    localStream,
    peers: Array.from(peers.values()),
    connectionStates,
    startCall,
    endCall
  };
};
