
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

  // Simulate call connection for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      setCallStatus('connected');
      callStartTimeRef.current = Date.now();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black z-[9999] flex flex-col items-center justify-center" style={{ zIndex: 9999 }}>
      {/* Remote audio element */}
      <audio ref={remoteAudioRef} autoPlay />
      
      {/* Call interface */}
      <div className="text-center text-white space-y-8 relative z-[10000]">
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
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-[10000]">
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

export default AudioCall;
