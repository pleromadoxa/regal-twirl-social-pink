import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import { useCallSounds } from '@/hooks/useCallSounds';
import { EnhancedCallControls } from './EnhancedCallControls';
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
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
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

  const handleToggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
    // In a real implementation, you would toggle speaker/earpiece here
  };

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true, 
          audio: true 
        });
        setIsScreenSharing(true);
        
        // Replace video track with screen share
        // This would be implemented in the WebRTC service
      } else {
        // Stop screen sharing and return to camera
        setIsScreenSharing(false);
        // This would switch back to camera in the WebRTC service
      }
    } catch (error) {
      console.error('Error with screen sharing:', error);
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
        <EnhancedCallControls
          isAudioEnabled={callState.isAudioEnabled}
          isVideoEnabled={callState.isVideoEnabled}
          isSpeakerEnabled={isSpeakerEnabled}
          callType="video"
          status={callState.status}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleSpeaker={handleToggleSpeaker}
          onEndCall={handleEndCall}
          onScreenShare={handleScreenShare}
          onAnswer={handleAnswer}
          isIncoming={isIncoming}
          isScreenSharing={isScreenSharing}
        />
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