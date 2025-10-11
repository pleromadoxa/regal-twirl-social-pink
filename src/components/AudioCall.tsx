import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Settings, Signal, RefreshCw } from 'lucide-react';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import { useCallSounds } from '@/hooks/useCallSounds';
import { EnhancedCallControls } from './EnhancedCallControls';
import { CallDiagnostics } from './CallDiagnostics';
import { CallQualityIndicator } from './CallQualityIndicator';
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
    initializeCall,
    forceReconnect
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
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center text-white z-50 overflow-hidden">
      <audio ref={audioRef} autoPlay />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full animate-pulse blur-xl" />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full animate-pulse blur-xl animation-delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-pink-500/10 rounded-full animate-pulse blur-xl animation-delay-2000" />
      </div>
      
      <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 max-w-6xl w-full px-4">
        {/* Main Call Interface */}
        <div className="text-center space-y-8 max-w-sm relative z-10">
          {/* Connection Status Indicator */}
          <div className="absolute -top-4 right-0 lg:right-8">
            <CallQualityIndicator
              connectionState={callState.connectionState}
              iceConnectionState={callState.iceConnectionState}
              networkQuality={callState.networkQuality}
              bitrate={callState.networkStats?.bitrate}
              packetLoss={callState.networkStats?.packetLoss}
              className="animate-fade-in"
            />
          </div>
          
          {/* User Avatar and Info */}
          <div className="space-y-6">
            <div className="relative">
              <Avatar className="w-40 h-40 mx-auto ring-4 ring-white/30 shadow-2xl transition-all duration-500 hover:ring-white/50">
                <AvatarImage src={otherUserAvatar} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-5xl">
                  {otherUserName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Audio visualization */}
              {callState.status === 'connected' && callState.remoteStream && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-1 bg-green-400 rounded-full animate-pulse`}
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
              
              {/* Audio status indicators */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <div className={`flex items-center gap-1.5 text-sm ${callState.isAudioEnabled ? 'text-green-400' : 'text-red-400'}`}>
                  {callState.isAudioEnabled ? (
                    <Mic className="w-4 h-4" />
                  ) : (
                    <MicOff className="w-4 h-4" />
                  )}
                  <span>{callState.isAudioEnabled ? 'Mic On' : 'Muted'}</span>
                </div>
                
                <div className={`flex items-center gap-1.5 text-sm ${isSpeakerEnabled ? 'text-blue-400' : 'text-gray-400'}`}>
                  {isSpeakerEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                  <span>{isSpeakerEnabled ? 'Speaker' : 'Earpiece'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center">
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
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="text-white/70 hover:text-white hover:bg-white/20 rounded-full px-4 py-2 transition-all duration-200 backdrop-blur-sm border border-white/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showDiagnostics ? 'Hide' : 'Show'} Diagnostics
            </Button>

            {/* Manual reconnection button for poor connections - only during active calls */}
            {callState.status !== 'ended' && callState.status !== 'idle' && (callState.error || callState.networkQuality === 'poor' || callState.networkQuality === 'disconnected') && (
              <Button
                variant="outline"
                size="sm"
                onClick={forceReconnect}
                className="text-white/70 hover:text-white hover:bg-orange-500/20 rounded-full px-4 py-2 transition-all duration-200 backdrop-blur-sm border border-orange-500/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reconnect
              </Button>
            )}
          </div>

          {/* Connection Status - only show during active calls */}
          {callState.error && callState.status !== 'ended' && callState.status !== 'idle' && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center animate-fade-in backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <p className="text-red-200 font-medium">Connection Issue</p>
              </div>
              <p className="text-red-300 text-sm">{callState.error}</p>
            </div>
          )}
        </div>

        {/* Diagnostics Panel */}
        {showDiagnostics && (
          <div className="animate-slide-in-right">
            <CallDiagnostics 
              callState={{
                ...callState,
                networkQuality: callState.networkQuality,
                networkStats: callState.networkStats
              }}
              onRefresh={refreshDiagnostics}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioCall;