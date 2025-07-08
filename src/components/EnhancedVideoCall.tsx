
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  PhoneOff,
  Minimize2,
  RotateCcw,
  Settings,
  Maximize2
} from 'lucide-react';
import { EnhancedWebRTCService, MediaPermissions } from '@/services/enhancedWebRTCService';
import { useAuth } from '@/contexts/AuthContext';

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
  // State management
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState<'initializing' | 'connecting' | 'connected' | 'ended'>('initializing');
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('new');
  const [iceConnectionState, setIceConnectionState] = useState<string>('new');
  const [permissions, setPermissions] = useState<MediaPermissions>({ camera: false, microphone: false });
  const [showSettings, setShowSettings] = useState(false);
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcServiceRef = useRef<EnhancedWebRTCService | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Format call duration
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start duration timer
  const startDurationTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    
    callStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallDuration(elapsed);
      }
    }, 1000);
  };

  // Stop duration timer
  const stopDurationTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  // Initialize call
  const initializeCall = async () => {
    try {
      console.log('[EnhancedVideoCall] Initializing video call');
      setCallStatus('initializing');
      
      const webrtcService = new EnhancedWebRTCService();
      webrtcServiceRef.current = webrtcService;

      // Check permissions first
      const mediaPermissions = await webrtcService.checkMediaPermissions();
      setPermissions(mediaPermissions);

      if (!mediaPermissions.camera || !mediaPermissions.microphone) {
        toast({
          title: "Permissions Required",
          description: "Please allow camera and microphone access to start the video call",
          variant: "destructive"
        });
        return;
      }

      // Set up event handlers
      webrtcService.onLocalStream((stream) => {
        console.log('[EnhancedVideoCall] Local stream received');
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      });

      webrtcService.onRemoteStream((stream) => {
        console.log('[EnhancedVideoCall] Remote stream received');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      });

      webrtcService.onConnectionStateChange((state) => {
        console.log('[EnhancedVideoCall] Connection state changed:', state);
        setConnectionState(state);
        
        if (state === 'connected') {
          setCallStatus('connected');
          startDurationTimer();
          toast({
            title: "Call Connected",
            description: `Video call with ${otherUserName} is now active`
          });
        } else if (state === 'failed' || state === 'closed') {
          handleCallFailure();
        }
      });

      webrtcService.onIceConnectionStateChange((state) => {
        console.log('[EnhancedVideoCall] ICE connection state changed:', state);
        setIceConnectionState(state);
        
        if (state === 'failed') {
          toast({
            title: "Connection Issues",
            description: "Experiencing network connectivity problems",
            variant: "destructive"
          });
        }
      });

      webrtcService.onError((error) => {
        console.error('[EnhancedVideoCall] WebRTC error:', error);
        toast({
          title: "Call Error",
          description: error.message,
          variant: "destructive"
        });
        
        if (error.message.includes('access denied') || error.message.includes('permission')) {
          setCallStatus('ended');
          handleEndCall();
        }
      });

      webrtcService.onCallEnd(() => {
        handleEndCall();
      });

      // Request media access
      setCallStatus('connecting');
      const localStream = await webrtcService.requestMediaPermissions(true, true);
      
      // Initialize peer connection
      webrtcService.initializePeerConnection();
      
      // Add local stream
      await webrtcService.addLocalStream(localStream);

      // Setup signaling
      const roomId = `video-call-${conversationId}-${Date.now()}`;
      webrtcService.setupSignaling(roomId, user?.id || 'anonymous');

      // Start call process
      if (!isIncoming) {
        console.log('[EnhancedVideoCall] Creating offer as initiator');
        await webrtcService.createOffer();
      }

    } catch (error) {
      console.error('[EnhancedVideoCall] Error initializing call:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize video call';
      
      toast({
        title: "Call Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      setCallStatus('ended');
      handleEndCall();
    }
  };

  // Handle call failure
  const handleCallFailure = () => {
    console.log('[EnhancedVideoCall] Call connection failed');
    setCallStatus('ended');
    toast({
      title: "Call Disconnected",
      description: "Video connection was lost. The call has ended.",
      variant: "destructive"
    });
    handleEndCall();
  };

  // Handle end call
  const handleEndCall = () => {
    console.log('[EnhancedVideoCall] Ending video call');
    
    stopDurationTimer();
    
    // Cleanup WebRTC resources
    if (webrtcServiceRef.current) {
      webrtcServiceRef.current.endCall();
      webrtcServiceRef.current = null;
    }

    setCallStatus('ended');
    onCallEnd();
  };

  // Toggle video
  const toggleVideo = () => {
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

  // Toggle audio
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

  // Switch camera (mobile)
  const switchCamera = async () => {
    if (webrtcServiceRef.current) {
      try {
        await webrtcServiceRef.current.switchCamera();
        toast({
          title: "Camera switched",
          description: "Switched between front and back camera"
        });
      } catch (error) {
        toast({
          title: "Camera switch failed",
          description: "Could not switch camera",
          variant: "destructive"
        });
      }
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeCall();
    
    return () => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.cleanup();
      }
      stopDurationTimer();
    };
  }, []);

  // Render minimized widget
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-64 bg-black/90 border-white/20 backdrop-blur-lg text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={otherUserAvatar} />
                  <AvatarFallback className="bg-purple-500 text-white text-xs">
                    {otherUserName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{otherUserName}</p>
                  <p className="text-xs text-white/60">{formatCallDuration(callDuration)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(false)}
                className="text-white hover:bg-white/10 p-1 h-auto"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex justify-center gap-2">
              <Button
                variant={isAudioEnabled ? "secondary" : "destructive"}
                size="sm"
                onClick={toggleAudio}
                className="rounded-full w-8 h-8 p-0"
              >
                {isAudioEnabled ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
              </Button>
              
              <Button
                variant={isVideoEnabled ? "secondary" : "destructive"}
                size="sm"
                onClick={toggleVideo}
                className="rounded-full w-8 h-8 p-0"
              >
                {isVideoEnabled ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />}
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndCall}
                className="rounded-full w-8 h-8 p-0"
              >
                <PhoneOff className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main call interface
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

        {/* Top controls */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
          >
            <Minimize2 className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Call info for connecting state */}
        {callStatus !== 'connected' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white/20">
              <AvatarImage src={otherUserAvatar} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {otherUserName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{otherUserName}</h2>
            <p className="text-white/75">
              {callStatus === 'initializing' && 'Initializing call...'}
              {callStatus === 'connecting' && 'Connecting video call...'}
              {callStatus === 'ended' && 'Call ended'}
            </p>
            {showSettings && (
              <div className="text-xs opacity-50 mt-4 space-y-1">
                <div>Connection: {connectionState}</div>
                <div>ICE: {iceConnectionState}</div>
                <div>Permissions: {permissions.camera ? '📹' : '❌'} {permissions.microphone ? '🎤' : '❌'}</div>
              </div>
            )}
          </div>
        )}

        {/* Call status */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-2 text-white/75 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
            <div className={`w-2 h-2 rounded-full ${
              callStatus === 'connected' ? 'bg-green-400' :
              callStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
              callStatus === 'initializing' ? 'bg-blue-400 animate-pulse' :
              'bg-red-400'
            }`}></div>
            <span className="text-sm">
              {callStatus === 'connected' ? formatCallDuration(callDuration) :
               callStatus === 'connecting' ? 'Connecting' :
               callStatus === 'initializing' ? 'Initializing' :
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
              
              {/* Camera switch (mobile) */}
              {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={switchCamera}
                  className="rounded-full w-14 h-14 p-0"
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
              )}
              
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

export default EnhancedVideoCall;
