
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  PhoneOff,
  Minimize2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCallSounds } from '@/hooks/useCallSounds';
import { useCallHistory } from '@/hooks/useCallHistory';
import MinimizedCallWidget from './MinimizedCallWidget';
import { WebRTCService } from '@/services/webrtcService';

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
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('new');
  const [iceConnectionState, setIceConnectionState] = useState<string>('new');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const callSessionStartRef = useRef<string>(new Date().toISOString());
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { playConnect, playEndCall, stopRinging } = useCallSounds();
  const { addCallToHistory } = useCallHistory();

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const initializeCall = async () => {
    try {
      console.log('[VideoCall] Initializing video call');
      
      webrtcServiceRef.current = new WebRTCService();
      const webrtcService = webrtcServiceRef.current;

      // Set up event handlers
      webrtcService.onLocalStream((stream) => {
        console.log('[VideoCall] Local stream received');
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      });

      webrtcService.onRemoteStream((stream) => {
        console.log('[VideoCall] Remote stream received');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      });

      webrtcService.onConnectionStateChange((state) => {
        console.log('[VideoCall] Connection state:', state);
        setConnectionState(state);
        
        if (state === 'connected') {
          setCallStatus('connected');
          callStartTimeRef.current = Date.now();
          stopRinging();
          playConnect();
        } else if (state === 'failed' || state === 'disconnected') {
          handleCallFailure();
        }
      });

      webrtcService.onIceConnectionStateChange((state) => {
        console.log('[VideoCall] ICE connection state:', state);
        setIceConnectionState(state);
      });

      webrtcService.onError((error) => {
        console.error('[VideoCall] WebRTC error:', error);
        toast({
          title: "Call Error",
          description: error.message,
          variant: "destructive"
        });
        
        if (error.message.includes('access denied')) {
          setCallStatus('ended');
          handleEndCall();
        }
      });

      // Initialize media with video
      const localStream = await webrtcService.initializeMedia({
        video: true,
        audio: true
      });

      // Initialize peer connection
      webrtcService.initializePeerConnection();
      
      // Add local stream
      await webrtcService.addLocalStream(localStream);

      // Setup signaling
      const channelName = `video-call-${conversationId}-${Date.now()}`;
      webrtcService.setupSignaling(channelName);

      // Start call process
      if (!isIncoming) {
        console.log('[VideoCall] Creating offer as initiator');
        const offer = await webrtcService.createOffer();
        // Offer will be sent through signaling automatically
      }

    } catch (error) {
      console.error('[VideoCall] Error initializing call:', error);
      toast({
        title: "Call Failed",
        description: "Failed to initialize video call. Please check your camera and microphone permissions.",
        variant: "destructive"
      });
      handleEndCall();
    }
  };

  const handleCallFailure = () => {
    console.log('[VideoCall] Call connection failed');
    setCallStatus('ended');
    toast({
      title: "Call Disconnected",
      description: "Video connection was lost. The call has ended.",
      variant: "destructive"
    });
    handleEndCall();
  };

  const handleEndCall = async () => {
    console.log('[VideoCall] Ending video call');
    
    playEndCall();
    
    const endTime = new Date().toISOString();
    const duration = callStartTimeRef.current ? 
      Math.floor((Date.now() - callStartTimeRef.current) / 1000) : 0;

    if (user) {
      await addCallToHistory({
        recipient_id: otherUserId,
        conversation_id: conversationId,
        call_type: 'video',
        call_status: callStatus === 'connected' ? 'completed' : 'failed',
        duration_seconds: duration,
        started_at: callSessionStartRef.current,
        ended_at: endTime
      });
    }

    // Cleanup WebRTC resources
    if (webrtcServiceRef.current) {
      webrtcServiceRef.current.cleanup();
      webrtcServiceRef.current = null;
    }

    setCallStatus('ended');
    onCallEnd();
  };

  const toggleVideo = async () => {
    if (webrtcServiceRef.current) {
      const newState = !isVideoEnabled;
      webrtcServiceRef.current.toggleVideo(newState);
      setIsVideoEnabled(newState);
      
      toast({
        title: newState ? "Camera enabled" : "Camera disabled",
        description: newState ? "You are now visible" : "Your camera is off"
      });
    }
  };

  const toggleAudio = () => {
    if (webrtcServiceRef.current) {
      const newState = !isAudioEnabled;
      webrtcServiceRef.current.toggleAudio(newState);
      setIsAudioEnabled(newState);
      
      toast({
        title: newState ? "Microphone enabled" : "Microphone disabled",
        description: newState ? "You are now audible" : "You are now muted"
      });
    }
  };

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
    initializeCall();
    
    return () => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.cleanup();
      }
    };
  }, []);

  if (isMinimized) {
    return (
      <MinimizedCallWidget
        otherUserName={otherUserName}
        otherUserAvatar={otherUserAvatar}
        callType="video"
        duration={formatCallDuration(callDuration)}
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        onMaximize={() => setIsMinimized(false)}
        onEndCall={handleEndCall}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black flex flex-col"
      style={{ 
        zIndex: 2147483647,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Video container */}
      <div className="flex-1 relative">
        {/* Remote video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local video */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-white/20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-purple-500 text-white text-xl">
                  {user?.user_metadata?.display_name?.[0] || 'Y'}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        {/* Minimize button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(true)}
          className="absolute top-4 left-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
        >
          <Minimize2 className="w-5 h-5" />
        </Button>

        {/* Call info for connecting state */}
        {callStatus === 'connecting' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white/20">
              <AvatarImage src={otherUserAvatar} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {otherUserName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{otherUserName}</h2>
            <p className="text-white/75">Connecting video call...</p>
            <div className="text-xs opacity-50 mt-2 space-y-1">
              <div>Connection: {connectionState}</div>
              <div>ICE: {iceConnectionState}</div>
            </div>
          </div>
        )}

        {/* Call status */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-2 text-white/75 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
            <div className={`w-2 h-2 rounded-full ${
              callStatus === 'connected' ? 'bg-green-400' :
              callStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
              'bg-red-400'
            }`}></div>
            <span className="text-sm">
              {callStatus === 'connected' ? formatCallDuration(callDuration) :
               callStatus === 'connecting' ? 'Connecting' :
               'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6">
        <Card className="bg-black/40 border-white/20 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-6">
              <Button
                variant={isVideoEnabled ? "default" : "destructive"}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full w-14 h-14 p-0"
              >
                {isVideoEnabled ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
              </Button>
              
              <Button
                variant={isAudioEnabled ? "default" : "destructive"}
                size="lg"
                onClick={toggleAudio}
                className="rounded-full w-14 h-14 p-0"
              >
                {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
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

export default VideoCall;
