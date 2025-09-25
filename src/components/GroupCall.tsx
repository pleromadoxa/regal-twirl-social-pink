import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Users, 
  Settings,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDuration } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { enhancedCallService } from '@/services/enhancedCallService';

interface GroupCallProps {
  roomId: string;
  callType: 'audio' | 'video';
  onCallEnd: () => void;
}

interface Participant {
  id: string;
  name: string;
  avatar_url?: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  stream?: MediaStream;
}

const GroupCall = ({ roomId, callType, onCallEnd }: GroupCallProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const callStartTime = useRef<Date>(new Date());
  const durationInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    initializeGroupCall();
    
    // Start call duration timer
    durationInterval.current = setInterval(() => {
      const now = new Date();
      const duration = Math.floor((now.getTime() - callStartTime.current.getTime()) / 1000);
      setCallDuration(duration);
    }, 1000);

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      cleanupCall();
    };
  }, [roomId]);

  const initializeGroupCall = async () => {
    if (!user) return;

    try {
      // Get media stream
      const constraints = {
        audio: true,
        video: callType === 'video'
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      if (localVideoRef.current && callType === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Join the call using enhanced call service
      const userProfile = {
        id: user.id,
        name: profile?.display_name || profile?.username || 'Unknown User',
        avatar_url: profile?.avatar_url || null
      };

      await enhancedCallService.joinCall(roomId, user.id, userProfile);

      // Listen for call events
      setupCallEventListeners();

      toast({
        title: "Joined group call",
        description: "You've successfully joined the group call"
      });

    } catch (error) {
      console.error('Error initializing group call:', error);
      
      let errorMessage = 'Failed to join group call';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = `Please allow access to your ${callType === 'video' ? 'camera and microphone' : 'microphone'} and try again.`;
        } else if (error.name === 'NotFoundError') {
          errorMessage = `No ${callType === 'video' ? 'camera or microphone' : 'microphone'} found.`;
        }
      }

      toast({
        title: "Group call failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const setupCallEventListeners = () => {
    const channel = supabase.channel(`group-call-${roomId}`);
    
    channel
      .on('broadcast', { event: 'participant-joined' }, (payload) => {
        const newParticipant = payload.payload;
        setParticipants(prev => [...prev.filter(p => p.id !== newParticipant.id), newParticipant]);
      })
      .on('broadcast', { event: 'participant-left' }, (payload) => {
        const leftParticipant = payload.payload;
        setParticipants(prev => prev.filter(p => p.id !== leftParticipant.id));
      })
      .on('broadcast', { event: 'participant-audio-toggle' }, (payload) => {
        const { participantId, isEnabled } = payload.payload;
        setParticipants(prev => prev.map(p => 
          p.id === participantId ? { ...p, isAudioEnabled: isEnabled } : p
        ));
      })
      .on('broadcast', { event: 'participant-video-toggle' }, (payload) => {
        const { participantId, isEnabled } = payload.payload;
        setParticipants(prev => prev.map(p => 
          p.id === participantId ? { ...p, isVideoEnabled: isEnabled } : p
        ));
      })
      .subscribe();
  };

  const toggleAudio = async () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);

        // Broadcast audio state
        const channel = supabase.channel(`group-call-${roomId}`);
        await channel.send({
          type: 'broadcast',
          event: 'participant-audio-toggle',
          payload: {
            participantId: user?.id,
            isEnabled: audioTrack.enabled
          }
        });
      }
    }
  };

  const toggleVideo = async () => {
    if (localStream && callType === 'video') {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);

        // Broadcast video state
        const channel = supabase.channel(`group-call-${roomId}`);
        await channel.send({
          type: 'broadcast',
          event: 'participant-video-toggle',
          payload: {
            participantId: user?.id,
            isEnabled: videoTrack.enabled
          }
        });
      }
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
  };

  const endCall = async () => {
    try {
      if (user) {
        await enhancedCallService.endCall(user.id, profile?.display_name || profile?.username);
      }
      cleanupCall();
      onCallEnd();
    } catch (error) {
      console.error('Error ending group call:', error);
      cleanupCall();
      onCallEnd();
    }
  };

  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  const renderParticipant = (participant: Participant, index: number) => (
    <div key={participant.id} className="relative bg-gray-900 rounded-xl overflow-hidden">
      {participant.stream && callType === 'video' ? (
        <video
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          ref={(el) => {
            if (el && participant.stream) {
              el.srcObject = participant.stream;
            }
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900 to-blue-900">
          <Avatar className="w-16 h-16 ring-2 ring-white/30">
            <AvatarImage src={participant.avatar_url} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl">
              {participant.name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      {/* Participant overlay */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-black/50 rounded-lg p-2 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm truncate">{participant.name}</span>
            <div className="flex items-center gap-1">
              {!participant.isAudioEnabled && (
                <MicOff className="w-3 h-3 text-red-400" />
              )}
              {callType === 'video' && !participant.isVideoEnabled && (
                <VideoOff className="w-3 h-3 text-red-400" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-gray-900 rounded-xl p-4 text-white shadow-2xl border border-white/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              <span className="text-sm">Group Call ({participants.length + 1})</span>
            </div>
            <div className="text-sm text-gray-300">
              {formatDuration(callDuration)}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(false)}
              className="w-8 h-8 p-0 text-white hover:bg-white/20"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={endCall}
              className="w-8 h-8 p-0 text-red-400 hover:bg-red-500/20"
            >
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-green-400" />
          <div>
            <h1 className="text-white font-semibold">Group Call</h1>
            <p className="text-gray-300 text-sm">{participants.length + 1} participants • {formatDuration(callDuration)}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsMinimized(true)}
          className="text-white hover:bg-white/20"
        >
          <Minimize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Participants Grid */}
      <div className="flex-1 p-4">
        <div className={`grid gap-4 h-full ${
          participants.length === 0 ? 'grid-cols-1' :
          participants.length <= 2 ? 'grid-cols-2' :
          participants.length <= 4 ? 'grid-cols-2 grid-rows-2' :
          'grid-cols-3 grid-rows-2'
        }`}>
          
          {/* Local participant (yourself) */}
          <div className="relative bg-gray-900 rounded-xl overflow-hidden">
            {callType === 'video' && isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900 to-blue-900">
                <Avatar className="w-16 h-16 ring-2 ring-white/30">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl">
                    {(profile?.display_name || profile?.username || 'You')[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-black/50 rounded-lg p-2 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">You</span>
                  <div className="flex items-center gap-1">
                    {!isAudioEnabled && <MicOff className="w-3 h-3 text-red-400" />}
                    {callType === 'video' && !isVideoEnabled && <VideoOff className="w-3 h-3 text-red-400" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other participants */}
          {participants.map((participant, index) => renderParticipant(participant, index))}
        </div>
      </div>

      {/* Call Controls */}
      <div className="p-6 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            variant="ghost"
            onClick={toggleAudio}
            className={`w-14 h-14 rounded-full ${
              isAudioEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>

          {callType === 'video' && (
            <Button
              size="lg"
              variant="ghost"
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full ${
                isVideoEnabled 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>
          )}

          <Button
            size="lg"
            variant="ghost"
            onClick={toggleSpeaker}
            className={`w-14 h-14 rounded-full ${
              isSpeakerEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-500 hover:bg-gray-400 text-white'
            }`}
          >
            {isSpeakerEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </Button>

          <Button
            size="lg"
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          <Button
            size="lg"
            variant="ghost"
            className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
          >
            <Settings className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupCall;
