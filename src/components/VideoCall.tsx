import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff,
  Monitor,
  MonitorOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCallSounds } from '@/hooks/useCallSounds';
import { useCallHistory } from '@/hooks/useCallHistory';

interface VideoCallProps {
  conversationId: string;
  otherUserId: string;
  onCallEnd: () => void;
  isIncoming?: boolean;
}

const VideoCall = ({ conversationId, otherUserId, onCallEnd, isIncoming = false }: VideoCallProps) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const signalingChannelRef = useRef<any>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const callSessionStartRef = useRef<string>(new Date().toISOString());
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { playConnect, playEndCall, playRinging, stopRinging } = useCallSounds();
  const { addCallToHistory } = useCallHistory();

  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const initializePeerConnection = () => {
    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && signalingChannelRef.current) {
        signalingChannelRef.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            candidate: event.candidate,
            conversation_id: conversationId,
            from: user?.id,
            to: otherUserId
          }
        });
      }
    };

    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log('Video call connection state:', state);
      
      if (state === 'connected') {
        setCallStatus('connected');
        callStartTimeRef.current = Date.now();
        stopRinging();
        playConnect();
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        setCallStatus('ended');
        handleEndCall();
      }
    };

    return peerConnection;
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (peerConnectionRef.current) {
        stream.getTracks().forEach(track => {
          peerConnectionRef.current?.addTrack(track, stream);
        });
      }

      return stream;
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      toast({
        title: "Media access error",
        description: "Could not access camera or microphone",
        variant: "destructive"
      });
      throw error;
    }
  };

  const setupSignalingChannel = () => {
    const channel = supabase.channel(`video-call-${conversationId}-${Date.now()}`);
    
    channel.on('broadcast', {
      event: 'offer',
      payload: {
        conversation_id: conversationId,
        from: user?.id,
        to: otherUserId
      }
    }, async (payload) => {
      const offer = payload.payload.offer;
      await peerConnectionRef.current?.setRemoteDescription(offer);
      
      const answer = await peerConnectionRef.current?.createAnswer();
      await peerConnectionRef.current?.setLocalDescription(answer);
      
      signalingChannelRef.current.send({
        type: 'broadcast',
        event: 'answer',
        payload: {
          answer,
          conversation_id: conversationId,
          from: user?.id,
          to: otherUserId
        }
      });
    });

    channel.on('broadcast', {
      event: 'ice-candidate',
      payload: {
        candidate: null,
        conversation_id: conversationId,
        from: user?.id,
        to: otherUserId
      }
    }, (payload) => {
      const candidate = payload.payload.candidate;
      if (candidate) {
        peerConnectionRef.current?.addIceCandidate(candidate);
      }
    });

    channel.subscribe();
    return channel;
  };

  const startCall = async () => {
    try {
      peerConnectionRef.current = initializePeerConnection();
      signalingChannelRef.current = setupSignalingChannel();
      
      await startLocalStream();
      
      if (!isIncoming) {
        playRinging();
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        signalingChannelRef.current.send({
          type: 'broadcast',
          event: 'offer',
          payload: {
            offer,
            conversation_id: conversationId,
            from: user?.id,
            to: otherUserId
          }
        });
      }
    } catch (error) {
      console.error('Error starting video call:', error);
      handleEndCall();
    }
  };

  const handleEndCall = async () => {
    stopRinging();
    playEndCall();
    
    const endTime = new Date().toISOString();
    const duration = callStartTimeRef.current ? 
      Math.floor((Date.now() - callStartTimeRef.current) / 1000) : 0;

    // Add to call history
    if (user) {
      await addCallToHistory({
        recipient_id: otherUserId,
        conversation_id: conversationId,
        call_type: 'video',
        call_status: callStatus === 'connected' ? 'completed' : 'failed',
        duration_seconds: duration,
        started_at: callSessionStartRef.current,
        ended_at: endTime
      });
    }

    // Cleanup
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    if (signalingChannelRef.current) {
      signalingChannelRef.current.send({
        type: 'broadcast',
        event: 'call-end',
        payload: {
          conversation_id: conversationId,
          from: user?.id,
          to: otherUserId
        }
      });
      
      supabase.removeChannel(signalingChannelRef.current);
    }

    setCallStatus('ended');
    onCallEnd();
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (peerConnectionRef.current && localStreamRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        }
        
        setIsScreenSharing(true);
        
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          setIsScreenSharing(false);
        });
      } else {
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast({
        title: "Screen share error",
        description: "Could not start screen sharing",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    startCall();
    
    return () => {
      handleEndCall();
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black flex flex-col"
      style={{ 
        zIndex: 999999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Remote video */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Connecting overlay */}
        {callStatus === 'connecting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm" style={{ zIndex: 1000000 }}>
            <Card className="bg-black/60 border-white/20 text-white backdrop-blur-lg">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Connecting...</h3>
                <p className="text-white/70">Setting up video call</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Local video */}
      <div className="absolute top-6 right-6 w-40 h-30 bg-black/80 rounded-xl overflow-hidden border-2 border-white/30 shadow-2xl" style={{ zIndex: 1000000 }}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {!isVideoEnabled && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <VideoOff className="w-8 h-8 text-white/70" />
          </div>
        )}
      </div>

      {/* Call controls */}
      <Card className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 border-white/20 backdrop-blur-lg" style={{ zIndex: 1000000 }}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="rounded-full w-14 h-14 p-0"
            >
              {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </Button>
            
            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-14 h-14 p-0"
            >
              {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>
            
            <Button
              variant={isScreenSharing ? "secondary" : "outline"}
              size="lg"
              onClick={toggleScreenShare}
              className="rounded-full w-14 h-14 p-0"
            >
              {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndCall}
              className="rounded-full w-14 h-14 p-0"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Call status */}
      <div className="absolute top-6 left-6 text-white" style={{ zIndex: 1000000 }}>
        <div className="flex items-center space-x-3 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
          <div className={`w-3 h-3 rounded-full ${
            callStatus === 'connected' ? 'bg-green-400 animate-pulse' :
            callStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
            'bg-red-400'
          }`}></div>
          <span className="text-sm font-medium">
            {callStatus === 'connecting' && 'Connecting...'}
            {callStatus === 'connected' && 'Connected'}
            {callStatus === 'ended' && 'Call ended'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
