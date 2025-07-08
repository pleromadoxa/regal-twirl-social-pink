import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mic, 
  MicOff, 
  PhoneOff,
  Volume2,
  VolumeX,
  Minimize2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCallSounds } from '@/hooks/useCallSounds';
import { useCallHistory } from '@/hooks/useCallHistory';
import MinimizedCallWidget from './MinimizedCallWidget';

interface EnhancedAudioCallProps {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  onCallEnd: () => void;
  isIncoming?: boolean;
}

const EnhancedAudioCall = ({ 
  conversationId, 
  otherUserId, 
  otherUserName, 
  otherUserAvatar,
  onCallEnd, 
  isIncoming = false 
}: EnhancedAudioCallProps) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const signalingChannelRef = useRef<any>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const callSessionStartRef = useRef<string>(new Date().toISOString());
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { playConnect, playEndCall } = useCallSounds();
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
    playEndCall();
    
    // Calculate call duration
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

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Notify other user
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

  // Call duration timer
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

  // Render minimized widget if minimized
  if (isMinimized) {
    return (
      <MinimizedCallWidget
        otherUserName={otherUserName}
        otherUserAvatar={otherUserAvatar}
        callType="audio"
        duration={formatCallDuration(callDuration)}
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={false}
        onMaximize={() => setIsMinimized(false)}
        onEndCall={handleEndCall}
        onToggleAudio={toggleAudio}
        onToggleVideo={() => {}}
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black flex flex-col items-center justify-center"
      style={{ 
        zIndex: 2147483647,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Remote audio element */}
      <audio ref={remoteAudioRef} autoPlay />
      
      {/* Call interface */}
      <div className="text-center text-white space-y-8 relative">
        {/* Minimize button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(true)}
          className="absolute -top-12 right-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
        >
          <Minimize2 className="w-5 h-5" />
        </Button>

        {/* User avatar */}
        <div className="relative">
          <Avatar className="w-32 h-32 mx-auto border-4 border-white/20">
            <AvatarImage src={otherUserAvatar} />
            <AvatarFallback className="text-4xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {otherUserName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Pulse animation when connecting */}
          {callStatus === 'connecting' && (
            <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping"></div>
          )}
        </div>

        {/* User name and call info */}
        <div>
          <h2 className="text-2xl font-bold">{otherUserName}</h2>
          <p className="text-lg opacity-75 mt-2">
            {callStatus === 'connecting' && 'Connecting...'}
            {callStatus === 'connected' && formatCallDuration(callDuration)}
            {callStatus === 'ended' && 'Call ended'}
          </p>
        </div>

        {/* Call controls */}
        <Card className="bg-black/40 border-white/20 backdrop-blur-lg">
          <CardContent className="p-6">
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
                className="rounded-full w-14 h-14 p-0"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call status indicator */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 text-white/75">
          <div className={`w-2 h-2 rounded-full ${
            callStatus === 'connected' ? 'bg-green-400' :
            callStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
            'bg-red-400'
          }`}></div>
          <span className="text-sm">
            {callStatus === 'connected' ? 'Connected' :
             callStatus === 'connecting' ? 'Connecting' :
             'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAudioCall;
