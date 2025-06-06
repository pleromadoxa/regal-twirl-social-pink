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
      console.log('Connection state:', state);
      
      if (state === 'connected') {
        setCallStatus('connected');
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
      console.error('Error accessing media devices:', error);
      toast({
        title: "Media access error",
        description: "Could not access camera or microphone",
        variant: "destructive"
      });
      throw error;
    }
  };

  const setupSignalingChannel = () => {
    const channel = supabase.channel(`call-${conversationId}-${Date.now()}`);
    
    channel.on('broadcast', { event: 'offer' }, async (payload) => {
      const { offer, from } = payload.payload;
      if (from !== user?.id && peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        channel.send({
          type: 'broadcast',
          event: 'answer',
          payload: {
            answer,
            conversation_id: conversationId,
            from: user?.id,
            to: from
          }
        });
      }
    });

    channel.on('broadcast', { event: 'answer' }, async (payload) => {
      const { answer, from } = payload.payload;
      if (from !== user?.id && peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    channel.on('broadcast', { event: 'ice-candidate' }, async (payload) => {
      const { candidate, from } = payload.payload;
      if (from !== user?.id && peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    channel.on('broadcast', { event: 'call-end' }, (payload) => {
      const { from } = payload.payload;
      if (from !== user?.id) {
        handleEndCall();
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
      console.error('Error starting call:', error);
      handleEndCall();
    }
  };

  const handleEndCall = async () => {
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
          startLocalStream();
        });
      } else {
        await startLocalStream();
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
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black z-50 flex flex-col">
      {/* Remote video with enhanced overlay */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Enhanced connecting overlay */}
        {callStatus === 'connecting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <Card className="bg-black/60 border-white/20 text-white backdrop-blur-lg">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Connecting...</h3>
                <p className="text-white/70">Setting up video call</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Enhanced local video */}
      <div className="absolute top-6 right-6 w-40 h-30 bg-black/80 rounded-xl overflow-hidden border-2 border-white/30 shadow-2xl">
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

      {/* Enhanced call controls */}
      <Card className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 border-white/20 backdrop-blur-lg">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="rounded-full w-14 h-14 p-0 shadow-lg transition-all duration-200 hover:scale-110"
            >
              {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </Button>
            
            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-14 h-14 p-0 shadow-lg transition-all duration-200 hover:scale-110"
            >
              {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>
            
            <Button
              variant={isScreenSharing ? "secondary" : "outline"}
              size="lg"
              onClick={toggleScreenShare}
              className="rounded-full w-14 h-14 p-0 shadow-lg transition-all duration-200 hover:scale-110"
            >
              {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndCall}
              className="rounded-full w-14 h-14 p-0 bg-red-500 hover:bg-red-600 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced call status */}
      <div className="absolute top-6 left-6 text-white">
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
