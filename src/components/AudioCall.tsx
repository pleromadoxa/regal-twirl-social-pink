import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import { useCallSounds } from '@/hooks/useCallSounds';
import { formatDuration } from '@/lib/utils';

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
  const audioRef = useRef<HTMLAudioElement>(null);
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

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black flex flex-col items-center justify-center text-white z-50">
      <audio ref={audioRef} autoPlay />
      
      <div className="text-center space-y-8 max-w-sm">
        {/* User Avatar and Info */}
        <div className="space-y-4">
          <Avatar className="w-32 h-32 mx-auto ring-4 ring-white/20">
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
          {/* Mute Button */}
          <Button
            variant={callState.isAudioEnabled ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-14 h-14 p-0"
            disabled={callState.status !== 'connected'}
          >
            {callState.isAudioEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </Button>

          {/* Answer/End Call Button */}
          {isIncoming && callState.status === 'idle' ? (
            <div className="flex gap-4">
              <Button
                variant="default"
                size="lg"
                onClick={handleAnswer}
                className="rounded-full w-14 h-14 p-0 bg-green-500 hover:bg-green-600"
              >
                <Volume2 className="w-6 h-6" />
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
          ) : (
            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndCall}
              className="rounded-full w-14 h-14 p-0"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          )}

          {/* Speaker Button */}
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {}}
            className="rounded-full w-14 h-14 p-0"
            disabled={callState.status !== 'connected'}
          >
            <Volume2 className="w-6 h-6" />
          </Button>
        </div>

        {/* Connection Status */}
        {callState.error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
            <p className="text-red-200">Connection error: {callState.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioCall;