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
import { useCallHistory } from '@/hooks/useCallHistory';

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

  const handleEndCall = async () => {
    const endTime = new Date().toISOString();
    const duration = callStartTimeRef.current ? 
      Math.floor((Date.now() - callStartTimeRef.current) / 1000) : 0;

    // Add to call history
    if (user) {
      await addCallToHistory({
        recipient_id: otherUserId,
        conversation_id: conversationId,
        call_type: 'audio',
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
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black backdrop-blur-xl z-50 flex items-center justify-center">
      <audio ref={remoteAudioRef} autoPlay />
      
      <Card className="w-full max-w-md bg-black/40 border-white/20 text-white backdrop-blur-lg">
        <CardContent className="p-8 text-center">
          {/* Caller avatar with enhanced animations */}
          <div className="relative mb-8">
            <Avatar className="w-32 h-32 mx-auto border-4 border-white/30 shadow-2xl">
              <AvatarImage src={otherUserAvatar} />
              <AvatarFallback className="text-4xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {otherUserName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Enhanced pulse animations */}
            {callStatus === 'connected' && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-green-400/50 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-4 border-green-400/30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-0 rounded-full border-4 border-green-400/20 animate-ping" style={{ animationDelay: '1s' }}></div>
              </>
            )}
            
            {callStatus === 'connecting' && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-yellow-400/50 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-4 border-yellow-400/30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </>
            )}
          </div>

          {/* Call info with better typography */}
          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-bold text-white">{otherUserName}</h2>
            <p className="text-xl text-white/80">
              {callStatus === 'connecting' && (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  Connecting...
                </span>
              )}
              {callStatus === 'connected' && (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  {formatCallDuration(callDuration)}
                </span>
              )}
              {callStatus === 'ended' && (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  Call ended
                </span>
              )}
            </p>
          </div>

          {/* Enhanced call controls */}
          <div className="flex items-center justify-center space-x-6 mb-6">
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="rounded-full w-16 h-16 p-0 shadow-lg transition-all duration-200 hover:scale-110"
            >
              {isAudioEnabled ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
            </Button>
            
            <Button
              variant={isSpeakerEnabled ? "secondary" : "outline"}
              size="lg"
              onClick={toggleSpeaker}
              className="rounded-full w-16 h-16 p-0 shadow-lg transition-all duration-200 hover:scale-110"
            >
              {isSpeakerEnabled ? <Volume2 className="w-7 h-7" /> : <VolumeX className="w-7 h-7" />}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndCall}
              className="rounded-full w-16 h-16 p-0 bg-red-500 hover:bg-red-600 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <PhoneOff className="w-7 h-7" />
            </Button>
          </div>

          {/* Enhanced status indicator */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3 bg-black/30 px-4 py-2 rounded-full">
              <div className={`w-3 h-3 rounded-full ${
                callStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                callStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                'bg-red-400'
              }`}></div>
              <span className="text-sm font-medium">
                {callStatus === 'connected' ? 'Connected' :
                 callStatus === 'connecting' ? 'Connecting' :
                 'Disconnected'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioCall;
