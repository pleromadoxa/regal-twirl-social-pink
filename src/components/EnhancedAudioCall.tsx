
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useDirectWebRTCCall } from '@/hooks/useDirectWebRTCCall';
import { useCallSounds } from '@/hooks/useCallSounds';
import { EnhancedCallControls } from './EnhancedCallControls';
import { CallQualityIndicator } from './CallQualityIndicator';
import { formatDuration } from '@/lib/utils';
import { Signal, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [duration, setDuration] = useState(0);
  const { playRinging, stopRinging, playConnect, playEndCall } = useCallSounds();
  
  const {
    isInCall,
    localStream,
    remoteStream,
    connectionState,
    isAudioEnabled,
    startCall,
    endCall,
    toggleAudio
  } = useDirectWebRTCCall({
    conversationId,
    callType: 'audio',
    onCallEnd: () => {
      playEndCall();
      onCallEnd();
    }
  });

  // Auto-start call if not incoming
  useEffect(() => {
    if (!isIncoming) {
      playRinging();
      startCall();
    }
  }, [isIncoming, startCall, playRinging]);

  // Handle remote audio
  useEffect(() => {
    if (remoteStream && audioRef.current) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Handle connection state
  useEffect(() => {
    if (connectionState === 'connected') {
      stopRinging();
      playConnect();
    }
  }, [connectionState, stopRinging, playConnect]);

  // Duration timer
  useEffect(() => {
    if (connectionState === 'connected') {
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [connectionState]);

  const handleEndCall = () => {
    stopRinging();
    endCall();
  };

  const handleAnswer = () => {
    if (isIncoming) {
      startCall();
    }
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
  };

  const getStatusText = () => {
    if (connectionState === 'connected') {
      return formatDuration(duration);
    }
    if (connectionState === 'connecting' || connectionState === 'new') {
      return 'Connecting...';
    }
    if (connectionState === 'failed') {
      return 'Call failed';
    }
    return isIncoming ? 'Incoming call...' : 'Calling...';
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center text-white z-[100] overflow-hidden">
      <audio ref={audioRef} autoPlay />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full animate-pulse blur-xl" />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full animate-pulse blur-xl animation-delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-pink-500/10 rounded-full animate-pulse blur-xl animation-delay-2000" />
      </div>
      
      <div className="relative flex flex-col items-center justify-center gap-8 max-w-sm px-4 z-10">
        <div className="absolute -top-4 right-0">
          <CallQualityIndicator
            connectionState={connectionState}
            iceConnectionState={connectionState === 'connected' ? 'connected' : 'new'}
            networkQuality={connectionState === 'connected' ? 'good' : 'disconnected'}
            className="animate-fade-in"
          />
        </div>
        
        <div className="space-y-6 text-center">
          <div className="relative">
            <Avatar className="w-40 h-40 mx-auto ring-4 ring-white/30 shadow-2xl">
              <AvatarImage src={otherUserAvatar} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-5xl">
                {otherUserName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {connectionState === 'connected' && remoteStream && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-1 bg-green-400 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 12 + 4}px`,
                        animationDelay: `${i * 100}ms`,
                        animationDuration: `${500 + Math.random() * 500}ms`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              {otherUserName}
            </h2>
            <div className="flex items-center justify-center gap-3">
              <Signal className="w-4 h-4 text-green-400" />
              <p className="text-xl opacity-90">{getStatusText()}</p>
            </div>
            
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className={`flex items-center gap-1.5 text-sm ${isAudioEnabled ? 'text-green-400' : 'text-red-400'}`}>
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span>{isAudioEnabled ? 'Mic On' : 'Muted'}</span>
              </div>
              
              <div className={`flex items-center gap-1.5 text-sm ${isSpeakerEnabled ? 'text-blue-400' : 'text-gray-400'}`}>
                {isSpeakerEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{isSpeakerEnabled ? 'Speaker' : 'Earpiece'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <EnhancedCallControls
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={false}
            isSpeakerEnabled={isSpeakerEnabled}
            callType="audio"
            status={connectionState === 'connected' ? 'connected' : 'connecting'}
            onToggleAudio={toggleAudio}
            onToggleVideo={() => {}}
            onToggleSpeaker={handleToggleSpeaker}
            onEndCall={handleEndCall}
            onAnswer={handleAnswer}
            isIncoming={isIncoming}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedAudioCall;
