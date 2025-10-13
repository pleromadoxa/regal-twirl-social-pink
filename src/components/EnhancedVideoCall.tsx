import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useDirectWebRTCCall } from '@/hooks/useDirectWebRTCCall';
import { useCallSounds } from '@/hooks/useCallSounds';
import { EnhancedCallControls } from './EnhancedCallControls';
import { CallQualityIndicator } from './CallQualityIndicator';
import { formatDuration } from '@/lib/utils';
import { Maximize2, Minimize2, VideoOff } from 'lucide-react';

interface EnhancedVideoCallProps {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  onCallEnd: () => void;
  isIncoming?: boolean;
}

const EnhancedVideoCall = ({ 
  conversationId, 
  otherUserId, 
  otherUserName, 
  otherUserAvatar,
  onCallEnd, 
  isIncoming = false 
}: EnhancedVideoCallProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isLocalVideoExpanded, setIsLocalVideoExpanded] = useState(false);
  const [duration, setDuration] = useState(0);
  const { playRinging, stopRinging, playConnect, playEndCall } = useCallSounds();
  
  const {
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
  } = useDirectWebRTCCall({
    conversationId,
    callType: 'video',
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

  // Handle local video
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Handle remote video
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
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
    return isIncoming ? 'Incoming video call...' : 'Calling...';
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-info/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />
      </div>

      <div className="relative flex-1">
        <div className="absolute top-4 left-4 z-30">
          <CallQualityIndicator
            connectionState={connectionState}
            iceConnectionState={connectionState === 'connected' ? 'connected' : 'new'}
            networkQuality={connectionState === 'connected' ? 'good' : 'disconnected'}
            className="animate-fade-in"
          />
        </div>
        
        {/* Remote Video (Main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover transition-all duration-300"
        />
        
        {/* Remote User Placeholder */}
        {(!remoteStream || connectionState !== 'connected') && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-gray-900 to-black flex items-center justify-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-primary/10 rounded-full animate-pulse blur-3xl" />
              <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-info/10 rounded-full animate-pulse blur-3xl animation-delay-1000" />
            </div>
            
            <div className="text-center text-foreground space-y-6 relative z-10 animate-fade-in">
              <Avatar className="w-40 h-40 mx-auto ring-4 ring-primary/30 shadow-2xl">
                <AvatarImage src={otherUserAvatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-5xl font-bold">
                  {otherUserName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-3">
                <h2 className="text-4xl font-bold">{otherUserName}</h2>
                <p className="text-xl text-muted-foreground">{getStatusText()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        <div 
          className={`absolute ${isLocalVideoExpanded ? 'top-4 left-4 w-80 h-60' : 'top-4 right-4 w-32 h-40'} bg-card rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 z-20 border-2 border-primary/20`}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLocalVideoExpanded(!isLocalVideoExpanded)}
              className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full"
            >
              {isLocalVideoExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
          
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-xs text-gray-400">Camera Off</span>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-2 left-2">
            <span className="text-xs text-white/80 bg-black/50 px-2 py-1 rounded">You</span>
          </div>
        </div>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <EnhancedCallControls
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isSpeakerEnabled={isSpeakerEnabled}
          callType="video"
          status={connectionState === 'connected' ? 'connected' : 'connecting'}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleSpeaker={handleToggleSpeaker}
          onEndCall={handleEndCall}
          onAnswer={handleAnswer}
          isIncoming={isIncoming}
        />
      </div>
    </div>
  );
};

export default EnhancedVideoCall;
