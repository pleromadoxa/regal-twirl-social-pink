
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
import MinimizedCallWidget from './MinimizedCallWidget';
import { WebRTCService } from '@/services/webrtcService';

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
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('new');
  const [iceConnectionState, setIceConnectionState] = useState<string>('new');
  
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const callSessionStartRef = useRef<string>(new Date().toISOString());
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { playConnect, playEndCall, playRinging, stopRinging } = useCallSounds();
  const { addCallToHistory } = useCallHistory();

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const initializeCall = async () => {
    try {
      console.log('[AudioCall] Initializing call');
      
      webrtcServiceRef.current = new WebRTCService();
      const webrtcService = webrtcServiceRef.current;

      // Set up event handlers
      webrtcService.onRemoteStream((stream) => {
        console.log('[AudioCall] Remote stream received');
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = stream;
        }
      });

      webrtcService.onConnectionStateChange((state) => {
        console.log('[AudioCall] Connection state:', state);
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
        console.log('[AudioCall] ICE connection state:', state);
        setIceConnectionState(state);
      });

      webrtcService.onError((error) => {
        console.error('[AudioCall] WebRTC error:', error);
        toast({
          title: "Call Error",
          description: error.message,
          variant: "destructive"
        });
        
        if (error.message.includes('Camera/microphone access denied')) {
          // Handle permission denied specifically
          setCallStatus('ended');
          handleEndCall();
        }
      });

      // Initialize media
      const localStream = await webrtcService.initializeMedia({
        video: false,
        audio: true
      });

      // Initialize peer connection
      webrtcService.initializePeerConnection();
      
      // Add local stream
      await webrtcService.addLocalStream(localStream);

      // Setup signaling
      const channelName = `audio-call-${conversationId}-${Date.now()}`;
      webrtcService.setupSignaling(channelName);

      // Start call process
      if (!isIncoming) {
        playRinging();
        console.log('[AudioCall] Creating offer as initiator');
        const offer = await webrtcService.createOffer();
        
        // Send offer through signaling
        // This would be handled by the WebRTC service internally
      }

    } catch (error) {
      console.error('[AudioCall] Error initializing call:', error);
      toast({
        title: "Call Failed",
        description: "Failed to initialize call. Please check your microphone permissions.",
        variant: "destructive"
      });
      handleEndCall();
    }
  };

  const handleCallFailure = () => {
    console.log('[AudioCall] Call connection failed');
    setCallStatus('ended');
    toast({
      title: "Call Disconnected",
      description: "Connection was lost. The call has ended.",
      variant: "destructive"
    });
    handleEndCall();
  };

  const handleEndCall = async () => {
    console.log('[AudioCall] Ending call');
    
    stopRinging();
    playEndCall();
    
    // Calculate call duration
    const endTime = new Date().toISOString();
    const duration = callStartTimeRef.current ? 
      Math.floor((Date.now() - callStartTimeRef.current) / 1000) : 0;

    // Add to call history
    if (user) {
      await addCallToHistory({
        recipient_id: otherUserId,
        conversation_id: conversationId,
        call_type: 'audio',
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

  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
    
    // Note: Speaker control through Web Audio API would require additional implementation
    toast({
      title: isSpeakerEnabled ? "Speaker disabled" : "Speaker enabled",
      description: "Audio output setting changed"
    });
  };

  // Call duration timer
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

  // Render minimized widget if minimized
  if (isMinimized) {
    return (
      <MinimizedCallWidget
        otherUserName={otherUserName}
        otherUserAvatar={otherUserAvatar}
        callType="audio"
        duration={formatCallDuration(callDuration)}
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={false}
        onMaximize={() => setIsMinimized(false)}
        onEndCall={handleEndCall}
        onToggleAudio={toggleAudio}
        onToggleVideo={() => {}}
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black flex flex-col items-center justify-center"
      style={{ 
        zIndex: 2147483647,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Remote audio element */}
      <audio ref={remoteAudioRef} autoPlay />
      
      {/* Call interface */}
      <div className="text-center text-white space-y-8 relative">
        {/* Minimize button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(true)}
          className="absolute -top-12 right-0 text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
        >
          <Minimize2 className="w-5 h-5" />
        </Button>

        {/* User avatar */}
        <div className="relative">
          <Avatar className="w-32 h-32 mx-auto border-4 border-white/20">
            <AvatarImage src={otherUserAvatar} />
            <AvatarFallback className="text-4xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {otherUserName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Pulse animation when connecting */}
          {callStatus === 'connecting' && (
            <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping"></div>
          )}
        </div>

        {/* User name and call info */}
        <div>
          <h2 className="text-2xl font-bold">{otherUserName}</h2>
          <p className="text-lg opacity-75 mt-2">
            {callStatus === 'connecting' && 'Connecting...'}
            {callStatus === 'connected' && formatCallDuration(callDuration)}
            {callStatus === 'ended' && 'Call ended'}
          </p>
          
          {/* Debug info (can be removed in production) */}
          <div className="text-xs opacity-50 mt-2 space-y-1">
            <div>Connection: {connectionState}</div>
            <div>ICE: {iceConnectionState}</div>
          </div>
        </div>

        {/* Call controls */}
        <Card className="bg-black/40 border-white/20 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-6">
              <Button
                variant={isAudioEnabled ? "default" : "destructive"}
                size="lg"
                onClick={toggleAudio}
                className="rounded-full w-14 h-14 p-0"
              >
                {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </Button>
              
              <Button
                variant={isSpeakerEnabled ? "secondary" : "outline"}
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

      {/* Call status indicator */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 text-white/75">
          <div className={`w-2 h-2 rounded-full ${
            callStatus === 'connected' ? 'bg-green-400' :
            callStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
            'bg-red-400'
          }`}></div>
          <span className="text-sm">
            {callStatus === 'connected' ? 'Connected' :
             callStatus === 'connecting' ? 'Connecting' :
             'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioCall;
