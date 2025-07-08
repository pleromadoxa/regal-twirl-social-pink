
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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCallSounds } from '@/hooks/useCallSounds';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(false);
  
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const callSessionStartRef = useRef<string>(new Date().toISOString());
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { playConnect, playEndCall } = useCallSounds();
  const { addCallToHistory } = useCallHistory();

  const {
    callState,
    endCall: endWebRTCCall,
    toggleAudio,
    toggleVideo
  } = useWebRTCCall({
    conversationId,
    otherUserId,
    callType: 'audio',
    isIncoming,
    onCallEnd
  });

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (callState.remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = callState.remoteStream;
    }
  }, [callState.remoteStream]);

  useEffect(() => {
    if (callState.status === 'connected') {
      playConnect();
    }
  }, [callState.status, playConnect]);

  const handleEndCall = async () => {
    console.log('[EnhancedAudioCall] Ending audio call');
    
    playEndCall();
    
    const endTime = new Date().toISOString();
    const duration = callState.duration;

    if (user) {
      await addCallToHistory({
        recipient_id: otherUserId,
        conversation_id: conversationId,
        call_type: 'audio',
        call_status: callState.status === 'connected' ? 'completed' : 'failed',
        duration_seconds: duration,
        started_at: callSessionStartRef.current,
        ended_at: endTime
      });
    }

    await endWebRTCCall();
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
    // In a real implementation, you would change audio output device here
    toast({
      title: isSpeakerEnabled ? "Speaker disabled" : "Speaker enabled",
      description: isSpeakerEnabled ? "Audio output through earpiece" : "Audio output through speaker"
    });
  };

  if (isMinimized) {
    return (
      <MinimizedCallWidget
        otherUserName={otherUserName}
        otherUserAvatar={otherUserAvatar}
        callType="audio"
        duration={formatCallDuration(callState.duration)}
        isAudioEnabled={callState.isAudioEnabled}
        isVideoEnabled={false}
        onMaximize={() => setIsMinimized(false)}
        onEndCall={handleEndCall}
        onToggleAudio={toggleAudio}
        onToggleVideo={() => {}} // No video in audio call
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center"
      style={{ 
        zIndex: 2147483647,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Hidden audio element for remote stream */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        className="hidden"
      />

      {/* Minimize button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMinimized(true)}
        className="absolute top-4 left-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
      >
        <Minimize2 className="w-5 h-5" />
      </Button>

      {/* Call status */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 text-white/75 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
          <div className={`w-2 h-2 rounded-full ${
            callState.status === 'connected' ? 'bg-green-400' :
            callState.status === 'connecting' ? 'bg-yellow-400 animate-pulse' :
            'bg-red-400'
          }`}></div>
          <span className="text-sm">
            {callState.status === 'connected' ? formatCallDuration(callState.duration) :
             callState.status === 'connecting' ? 'Connecting' :
             'Disconnected'}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="text-center text-white space-y-8">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-32 h-32 mx-auto border-4 border-white/20 shadow-2xl">
            <AvatarImage src={otherUserAvatar} />
            <AvatarFallback className="text-4xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {otherUserName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Audio indicator */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Audio Call
            </div>
          </div>
        </div>

        {/* User info */}
        <div>
          <h2 className="text-2xl font-bold">{otherUserName}</h2>
          <p className="text-white/75">
            {callState.status === 'connecting' ? 'Connecting audio call...' : 
             callState.status === 'connected' ? 'Audio call active' :
             'Call ended'}
          </p>
        </div>

        {/* Connection details for debugging */}
        {callState.status === 'connecting' && (
          <div className="text-xs opacity-50 space-y-1">
            <div>Connection: {callState.connectionState}</div>
            <div>ICE: {callState.iceConnectionState}</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <Card className="bg-black/40 border-white/20 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-6">
              <Button
                variant={callState.isAudioEnabled ? "default" : "destructive"}
                size="lg"
                onClick={toggleAudio}
                className="rounded-full w-14 h-14 p-0"
              >
                {callState.isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </Button>
              
              <Button
                variant={isSpeakerEnabled ? "default" : "secondary"}
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
    </div>
  );
};

export default EnhancedAudioCall;
