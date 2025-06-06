
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  Users,
  Volume2,
  VolumeX
} from 'lucide-react';
import { createCall, joinCall, endCall, subscribeToCallUpdates, ActiveCall } from '@/services/callService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RealTimeCallManagerProps {
  conversationId?: string;
  participants: Array<{
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  }>;
  onCallEnd?: () => void;
}

const RealTimeCallManager = ({ 
  conversationId, 
  participants, 
  onCallEnd 
}: RealTimeCallManagerProps) => {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video' | 'group'>('audio');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(false);
  const [incomingCall, setIncomingCall] = useState<ActiveCall | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Listen for incoming calls
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('incoming-calls')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'active_calls'
      }, (payload) => {
        const call = payload.new as ActiveCall;
        const isParticipant = call.participants.includes(user.id) || 
                            participants.some(p => p.id === call.caller_id);
        
        if (isParticipant && call.caller_id !== user.id) {
          setIncomingCall(call);
          toast({
            title: "Incoming call",
            description: `${call.call_type} call from ${participants.find(p => p.id === call.caller_id)?.display_name || 'Unknown'}`,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, participants]);

  const startCall = async (type: 'audio' | 'video' | 'group') => {
    if (!user) return;

    try {
      setCallType(type);
      const participantIds = participants.map(p => p.id).filter(id => id !== user.id);
      
      const call = await createCall(user.id, type, participantIds);
      setActiveCall(call);
      setIsInCall(true);

      // Notify participants via real-time channel
      const channel = supabase.channel(`call-invitation-${call.room_id}`);
      await channel.subscribe();
      
      participantIds.forEach(participantId => {
        channel.send({
          type: 'broadcast',
          event: 'call-invitation',
          payload: {
            call_id: call.id,
            room_id: call.room_id,
            caller_id: user.id,
            caller_name: user.user_metadata?.display_name || user.email,
            call_type: type,
            recipient_id: participantId
          }
        });
      });

      toast({
        title: "Call started",
        description: `${type} call initiated with ${participantIds.length} participant(s)`
      });

    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Call failed",
        description: "Could not start the call. Please try again.",
        variant: "destructive"
      });
    }
  };

  const acceptCall = async (call: ActiveCall) => {
    if (!user) return;

    try {
      await joinCall(call.id, user.id);
      setActiveCall(call);
      setIsInCall(true);
      setIncomingCall(null);
      setCallType(call.call_type);

      toast({
        title: "Call joined",
        description: `Joined ${call.call_type} call`
      });
    } catch (error) {
      console.error('Error joining call:', error);
      toast({
        title: "Join failed",
        description: "Could not join the call.",
        variant: "destructive"
      });
    }
  };

  const declineCall = () => {
    setIncomingCall(null);
    toast({
      title: "Call declined",
      description: "Call was declined"
    });
  };

  const endActiveCall = async () => {
    if (!activeCall) return;

    try {
      await endCall(activeCall.id);
      setActiveCall(null);
      setIsInCall(false);
      setCallType('audio');
      
      if (onCallEnd) onCallEnd();

      toast({
        title: "Call ended",
        description: "Call has been ended"
      });
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
  };

  // Incoming call popup
  if (incomingCall) {
    const caller = participants.find(p => p.id === incomingCall.caller_id);
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-purple-900 via-blue-900 to-black border-white/20 text-white">
          <CardContent className="p-8 text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white/20">
              <AvatarImage src={caller?.avatar_url} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {caller?.display_name?.[0] || caller?.username?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            
            <h2 className="text-2xl font-bold mb-2">
              {caller?.display_name || caller?.username || 'Unknown'}
            </h2>
            <p className="text-lg opacity-75 mb-6 flex items-center justify-center gap-2">
              {incomingCall.call_type === 'video' ? <Video className="w-5 h-5" /> : 
               incomingCall.call_type === 'group' ? <Users className="w-5 h-5" /> : 
               <Phone className="w-5 h-5" />}
              Incoming {incomingCall.call_type} call
            </p>
            
            <div className="flex items-center justify-center space-x-8">
              <Button
                variant="destructive"
                size="lg"
                onClick={declineCall}
                className="rounded-full w-16 h-16 p-0"
              >
                <PhoneOff className="w-8 h-8" />
              </Button>
              
              <Button
                variant="default"
                size="lg"
                onClick={() => acceptCall(incomingCall)}
                className="rounded-full w-16 h-16 p-0 bg-green-500 hover:bg-green-600"
              >
                {incomingCall.call_type === 'video' ? <Video className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active call interface
  if (isInCall && activeCall) {
    const otherParticipants = participants.filter(p => 
      activeCall.participants.includes(p.id) || p.id === activeCall.caller_id
    ).filter(p => p.id !== user?.id);

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black z-50 flex flex-col items-center justify-center text-white">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {otherParticipants.map((participant, index) => (
              <Avatar key={participant.id} className={`w-24 h-24 border-4 border-white/20 ${index > 0 ? '-ml-4' : ''}`}>
                <AvatarImage src={participant.avatar_url} />
                <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {participant.display_name?.[0] || participant.username?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            {otherParticipants.length === 1 
              ? otherParticipants[0].display_name || otherParticipants[0].username
              : `Group Call (${otherParticipants.length + 1} participants)`
            }
          </h2>
          <p className="text-lg opacity-75">
            {callType} call in progress
          </p>
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

              {callType === 'video' && (
                <Button
                  variant={isVideoEnabled ? "default" : "destructive"}
                  size="lg"
                  onClick={toggleVideo}
                  className="rounded-full w-14 h-14 p-0"
                >
                  {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </Button>
              )}
              
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
                onClick={endActiveCall}
                className="rounded-full w-14 h-14 p-0"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Call initiation buttons
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => startCall('audio')}
        className="text-slate-600 hover:text-purple-600 dark:text-slate-400"
      >
        <Phone className="w-5 h-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => startCall('video')}
        className="text-slate-600 hover:text-purple-600 dark:text-slate-400"
      >
        <Video className="w-5 h-5" />
      </Button>

      {participants.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => startCall('group')}
          className="text-slate-600 hover:text-purple-600 dark:text-slate-400"
        >
          <Users className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

export default RealTimeCallManager;
