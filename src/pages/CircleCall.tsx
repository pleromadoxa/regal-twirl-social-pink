import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';

interface Participant {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  status: 'connecting' | 'connected' | 'disconnected';
}

const CircleCall = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const roomId = searchParams.get('room');
  const circleId = searchParams.get('circleId');
  const callType = searchParams.get('call') as 'audio' | 'video';
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [circleName, setCircleName] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Initialize WebRTC call
  const { callState, endCall, toggleAudio, initializeCall } = useWebRTCCall({
    conversationId: roomId || '',
    otherUserId: '', // For group calls, this isn't used the same way
    callType: callType || 'audio',
    onCallEnd: () => {
      toast({
        title: "Call ended",
        description: "The circle call has ended"
      });
      navigate('/circles');
    }
  });

  useEffect(() => {
    if (!user || !roomId || !circleId) {
      navigate('/circles');
      return;
    }

    const setupCall = async () => {
      try {
        // Fetch circle details
        const { data: circle } = await supabase
          .from('user_circles')
          .select('name')
          .eq('id', circleId)
          .single();

        if (circle) {
          setCircleName(circle.name);
        }

        // Fetch circle call details
        const { data: call } = await supabase
          .from('circle_calls')
          .select('*, profiles!circle_calls_caller_id_fkey(display_name, username, avatar_url)')
          .eq('room_id', roomId)
          .single();

        if (call) {
          // Fetch all participant profiles
          const participantIds = Array.isArray(call.participants) 
            ? (call.participants as string[])
            : [];
          
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name, username, avatar_url')
            .in('id', participantIds);

          if (profiles) {
            setParticipants(profiles.map(p => ({
              ...p,
              status: 'connecting' as const
            })));
          }
        }

        // Initialize WebRTC
        await initializeCall();

        // Subscribe to real-time updates
        const channel = supabase.channel(`circle-call-${roomId}`);
        
        channel
          .on('broadcast', { event: 'participant-joined' }, ({ payload }) => {
            setParticipants(prev => prev.map(p => 
              p.id === payload.userId 
                ? { ...p, status: 'connected' }
                : p
            ));
          })
          .on('broadcast', { event: 'participant-left' }, ({ payload }) => {
            setParticipants(prev => prev.map(p => 
              p.id === payload.userId 
                ? { ...p, status: 'disconnected' }
                : p
            ));
          })
          .subscribe();

        // Broadcast that we joined
        channel.send({
          type: 'broadcast',
          event: 'participant-joined',
          payload: { userId: user.id }
        });

        return () => {
          channel.send({
            type: 'broadcast',
            event: 'participant-left',
            payload: { userId: user.id }
          });
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error setting up circle call:', error);
        toast({
          title: "Call setup failed",
          description: "Failed to initialize the call",
          variant: "destructive"
        });
        navigate('/circles');
      }
    };

    setupCall();
  }, [user, roomId, circleId, navigate, toast, initializeCall]);

  // Call duration timer
  useEffect(() => {
    if (callState.status === 'connected') {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState.status]);

  const handleEndCall = async () => {
    await endCall();
    
    // Update call status in database
    if (roomId) {
      await supabase
        .from('circle_calls')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('room_id', roomId);
    }
    
    navigate('/circles');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStatusText = () => {
    switch (callState.status) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return formatDuration(callDuration);
      case 'failed':
        return 'Connection failed';
      default:
        return 'Initializing...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex flex-col">
      {/* Header */}
      <div className="p-6 text-center text-white space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="w-5 h-5" />
          <h1 className="text-2xl font-bold">{circleName}</h1>
        </div>
        <p className="text-white/80 text-sm">{getCallStatusText()}</p>
        {callState.status === 'connected' && (
          <div className="flex items-center justify-center gap-2 text-xs text-white/60">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Connected
          </div>
        )}
      </div>

      {/* Participants Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-4 flex flex-col items-center space-y-3 border border-white/20"
            >
              <Avatar className="h-20 w-20 ring-4 ring-white/30">
                <AvatarImage src={participant.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl">
                  {(participant.display_name || participant.username)[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <p className="text-white font-medium text-sm">
                  {participant.display_name || `@${participant.username}`}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {participant.id === user?.id ? 'You' : 
                   participant.status === 'connected' ? 'Connected' :
                   participant.status === 'connecting' ? 'Connecting...' :
                   'Disconnected'}
                </p>
              </div>

              {/* Status indicator */}
              <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                participant.status === 'connected' ? 'bg-green-400' :
                participant.status === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                'bg-red-400'
              }`} />
            </div>
          ))}
        </div>
      </div>

      {/* Call Controls */}
      <div className="p-6 bg-black/30 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-4">
          {/* Mute Button */}
          <Button
            size="lg"
            variant={callState.isAudioEnabled ? "secondary" : "destructive"}
            className="rounded-full w-16 h-16 shadow-lg"
            onClick={toggleAudio}
          >
            {callState.isAudioEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </Button>

          {/* End Call Button */}
          <Button
            size="lg"
            variant="destructive"
            className="rounded-full w-20 h-20 shadow-xl bg-red-600 hover:bg-red-700"
            onClick={handleEndCall}
          >
            <PhoneOff className="w-8 h-8" />
          </Button>

          {/* Speaker Button */}
          <Button
            size="lg"
            variant={isSpeakerOn ? "secondary" : "outline"}
            className="rounded-full w-16 h-16 shadow-lg"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
          >
            {isSpeakerOn ? (
              <Volume2 className="w-6 h-6" />
            ) : (
              <VolumeX className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Connection Quality Indicator */}
        {callState.networkQuality && (
          <div className="text-center mt-4">
            <p className="text-white/60 text-xs">
              Network: {callState.networkQuality}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CircleCall;
