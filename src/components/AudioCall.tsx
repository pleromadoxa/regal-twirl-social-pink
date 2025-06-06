import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mic, 
  MicOff, 
  PhoneOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AudioCallProps {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  onCallEnd: () => void;
  isIncoming?: boolean;
}

const AudioCall = ({ 
  conversationId, 
  otherUserId, 
  otherUserName, 
  otherUserAvatar,
  onCallEnd, 
  isIncoming = false 
}: AudioCallProps) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const signalingChannelRef = useRef<any>(null);
  const callStartTimeRef = useRef<number | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log('Connection state:', state);
      
      if (state === 'connected') {
        setCallStatus('connected');
        callStartTimeRef.current = Date.now();
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
        video: false,
        audio: isAudioEnabled
      });

      localStreamRef.current = stream;

      if (peerConnectionRef.current) {
        stream.getTracks().forEach(track => {
          peerConnectionRef.current?.addTrack(track, stream);
        });
      }

      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access error",
        description: "Could not access microphone",
        variant: "destructive"
      });
      throw error;
    }
  };

  const setupSignalingChannel = () => {
    const channel = supabase.channel(`audio-call-${conversationId}-${Date.now()}`);
    
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

  const handleEndCall = () => {
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

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callStatus === 'connected' && callStartTimeRef.current) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current!) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  useEffect(() => {
    startCall();
    
    return () => {
      handleEndCall();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <audio ref={remoteAudioRef} autoPlay />
      
      <Card className="w-full max-w-md bg-gradient-to-br from-purple-900 via-blue-900 to-black border-white/20 text-white">
        <CardContent className="p-8 text-center">
          {/* Caller avatar with pulse animation */}
          <div className="relative mb-6">
            <Avatar className="w-24 h-24 mx-auto border-4 border-white/20">
              <AvatarImage src={otherUserAvatar} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {otherUserName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Pulse rings when connected */}
            {callStatus === 'connected' && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-green-400/40 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-4 border-green-400/20 animate-ping animation-delay-200"></div>
              </>
            )}
            
            {/* Pulse rings when connecting */}
            {callStatus === 'connecting' && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-yellow-400/40 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-4 border-yellow-400/20 animate-ping animation-delay-200"></div>
              </>
            )}
          </div>

          {/* Call info */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">{otherUserName}</h2>
            <p className="text-lg opacity-75">
              {callStatus === 'connecting' && 'Connecting...'}
              {callStatus === 'connected' && formatCallDuration(callDuration)}
              {callStatus === 'ended' && 'Call ended'}
            </p>
          </div>

          {/* Call actions */}
          <div className="flex items-center justify-center space-x-6">
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="rounded-full w-14 h-14 p-0"
            >
              {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </Button>
            
            <Button
              variant={isSpeakerEnabled ? "secondary" : "outline"}
              size="lg"
              onClick={toggleSpeaker}
              className="rounded-full w-14 h-14 p-0"
            >
              {isSpeakerEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndCall}
              className="rounded-full w-14 h-14 p-0 bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-center mt-6">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              callStatus === 'connected' ? 'bg-green-400' :
              callStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
              'bg-red-400'
            }`}></div>
            <span className="text-sm opacity-75">
              {callStatus === 'connected' ? 'Connected' :
               callStatus === 'connecting' ? 'Connecting' :
               'Disconnected'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioCall;
