import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import { useCallSounds } from '@/hooks/useCallSounds';
import { formatDuration } from '@/lib/utils';

interface VideoCallProps {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  onCallEnd: () => void;
  isIncoming?: boolean;
}

const VideoCall = ({ 
  conversationId, 
  otherUserId, 
  otherUserName, 
  otherUserAvatar,
  onCallEnd, 
  isIncoming = false 
}: VideoCallProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
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
    callType: 'video',
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
    if (callState.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = callState.localStream;
    }
  }, [callState.localStream]);

  useEffect(() => {
    if (callState.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = callState.remoteStream;
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
        return isIncoming ? 'Incoming video call...' : 'Calling...';
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Video Streams */}
      <div className="relative flex-1">
        {/* Remote Video (Main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Remote User Placeholder (when no video) */}
        {(!callState.remoteStream || callState.status !== 'connected') && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
            <div className="text-center text-white space-y-4">
              <Avatar className="w-32 h-32 mx-auto ring-4 ring-white/20">
                <AvatarImage src={otherUserAvatar} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-4xl">
                  {otherUserName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{otherUserName}</h2>
                <p className="text-lg opacity-75">{getStatusText()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-32 h-40 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!callState.isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center justify-center gap-6 bg-black/50 backdrop-blur-md rounded-full px-8 py-4">
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
                <Video className="w-6 h-6" />
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

          {/* Video Toggle Button */}
          <Button
            variant={callState.isVideoEnabled ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-14 h-14 p-0"
            disabled={callState.status !== 'connected'}
          >
            {callState.isVideoEnabled ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {callState.error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-200">Connection error: {callState.error}</p>
        </div>
      )}
    </div>
  );
};

export default VideoCall;