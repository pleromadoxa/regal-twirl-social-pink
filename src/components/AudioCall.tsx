import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import { useCallSounds } from '@/hooks/useCallSounds';
import { EnhancedCallControls } from './EnhancedCallControls';
import { CallDiagnostics } from './CallDiagnostics';
import { formatDuration } from '@/lib/utils';
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
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const { playRinging, stopRinging, playConnect, playEndCall } = useCallSounds();
  
  const {
    callState,
    endCall,
    toggleAudio,
    toggleVideo,
    initializeCall
  } = useWebRTCCall({
    conversationId,
    otherUserId,
    callType: 'audio',
    isIncoming,
    onCallEnd: () => {
      playEndCall();
      onCallEnd();
    }
  });

  useEffect(() => {
    if (!isIncoming) {
      playRinging();
      initializeCall();
    }
  }, [isIncoming, initializeCall, playRinging]);

  useEffect(() => {
    if (callState.status === 'connected') {
      stopRinging();
      playConnect();
    }
  }, [callState.status, stopRinging, playConnect]);

  useEffect(() => {
    if (callState.remoteStream && audioRef.current) {
      audioRef.current.srcObject = callState.remoteStream;
    }
  }, [callState.remoteStream]);

  const handleEndCall = () => {
    stopRinging();
    endCall();
  };

  const handleAnswer = () => {
    if (isIncoming) {
      initializeCall();
    }
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
    // In a real implementation, you would toggle speaker/earpiece here
  };

  const getStatusText = () => {
    switch (callState.status) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return formatDuration(callState.duration);
      case 'failed':
        return 'Call failed';
      default:
        return isIncoming ? 'Incoming call...' : 'Calling...';
    }
  };

  const refreshDiagnostics = () => {
    toast({
      title: "Diagnostics Updated",
      description: "Call diagnostics have been refreshed"
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center text-white z-50">
      <audio ref={audioRef} autoPlay />
      
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 max-w-6xl w-full px-4">
        {/* Main Call Interface */}
        <div className="text-center space-y-8 max-w-sm">
          {/* User Avatar and Info */}
          <div className="space-y-4">
            <Avatar className="w-32 h-32 mx-auto ring-4 ring-white/20 shadow-2xl">
              <AvatarImage src={otherUserAvatar} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-4xl">
                {otherUserName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="text-2xl font-bold">{otherUserName}</h2>
              <p className="text-lg opacity-75 mt-2">{getStatusText()}</p>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-6">
            <EnhancedCallControls
              isAudioEnabled={callState.isAudioEnabled}
              isVideoEnabled={false}
              isSpeakerEnabled={isSpeakerEnabled}
              callType="audio"
              status={callState.status}
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
              onToggleSpeaker={handleToggleSpeaker}
              onEndCall={handleEndCall}
              onAnswer={handleAnswer}
              isIncoming={isIncoming}
            />
          </div>

          {/* Additional Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showDiagnostics ? 'Hide' : 'Show'} Diagnostics
            </Button>
          </div>

          {/* Connection Status */}
          {callState.error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center animate-fade-in">
              <p className="text-red-200">Connection error: {callState.error}</p>
            </div>
          )}
        </div>

        {/* Diagnostics Panel */}
        {showDiagnostics && (
          <div className="animate-slide-in-right">
            <CallDiagnostics 
              callState={callState}
              onRefresh={refreshDiagnostics}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioCall;