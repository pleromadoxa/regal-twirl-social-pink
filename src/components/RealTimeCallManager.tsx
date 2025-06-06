
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  Users,
  Volume2,
  VolumeX,
  CheckCircle
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
    is_verified?: boolean;
    followers_count?: number;
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

  // Helper function to check if user is verified
  const isUserVerified = (participant: typeof participants[0]) => {
    return participant.username === 'pleromadoxa' || participant.is_verified || (participant.followers_count && participant.followers_count >= 100);
  };

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('incoming-calls')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'active_calls'
      }, (payload) => {
        const call = payload.new as any;
        const callData: ActiveCall = {
          ...call,
          call_type: call.call_type as 'audio' | 'video' | 'group',
          status: call.status as 'active' | 'ended',
          participants: Array.isArray(call.participants) ? call.participants as string[] : []
        };
        
        const isParticipant = callData.participants.includes(user.id) || 
                            participants.some(p => p.id === callData.caller_id);
        
        if (isParticipant && callData.caller_id !== user.id) {
          setIncomingCall(callData);
          toast({
            title: "Incoming call",
            description: `${callData.call_type} call from ${participants.find(p => p.id === callData.caller_id)?.display_name || 'Unknown'}`,
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

  // Enhanced incoming call popup
  if (incomingCall) {
    const caller = participants.find(p => p.id === incomingCall.caller_id);
    
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            {/* Caller avatar with enhanced pulse animation */}
            <div className="relative mb-8">
              <div className="relative">
                <Avatar className="w-28 h-28 mx-auto ring-4 ring-white/20 dark:ring-slate-700/40 shadow-xl">
                  <AvatarImage src={caller?.avatar_url} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 text-white font-semibold">
                    {caller?.display_name?.[0] || caller?.username?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                
                {/* Multiple pulse rings */}
                <div className="absolute inset-0 rounded-full ring-4 ring-purple-400/60 animate-ping"></div>
                <div className="absolute inset-0 rounded-full ring-4 ring-blue-400/40 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-0 rounded-full ring-4 ring-pink-400/30 animate-ping" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
            
            {/* Call info with verified badge */}
            <div className="mb-8 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {caller?.display_name || caller?.username || 'Unknown'}
                </h2>
                {caller && isUserVerified(caller) && (
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                {incomingCall.call_type === 'video' ? <Video className="w-5 h-5" /> : 
                 incomingCall.call_type === 'group' ? <Users className="w-5 h-5" /> : 
                 <Phone className="w-5 h-5" />}
                <span className="text-lg font-medium">
                  Incoming {incomingCall.call_type} call
                </span>
              </div>
              
              <div className="w-16 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full mx-auto"></div>
            </div>
            
            {/* Enhanced call actions */}
            <div className="flex items-center justify-center space-x-12">
              <Button
                variant="outline"
                size="lg"
                onClick={declineCall}
                className="rounded-full w-16 h-16 p-0 border-2 border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <PhoneOff className="w-7 h-7" />
              </Button>
              
              <Button
                size="lg"
                onClick={() => acceptCall(incomingCall)}
                className="rounded-full w-16 h-16 p-0 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-white"
              >
                {incomingCall.call_type === 'video' ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
              </Button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 font-medium">
              Tap to answer • Swipe to decline
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Enhanced active call interface
  if (isInCall && activeCall) {
    const otherParticipants = participants.filter(p => 
      activeCall.participants.includes(p.id) || p.id === activeCall.caller_id
    ).filter(p => p.id !== user?.id);

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            {/* Participants avatars */}
            <div className="relative mb-8">
              <div className="flex items-center justify-center mb-4">
                {otherParticipants.slice(0, 3).map((participant, index) => (
                  <div key={participant.id} className="relative">
                    <Avatar className={`w-20 h-20 ring-4 ring-white/20 dark:ring-slate-700/40 shadow-xl ${index > 0 ? '-ml-4' : ''}`}>
                      <AvatarImage src={participant.avatar_url} />
                      <AvatarFallback className="text-xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 text-white font-semibold">
                        {participant.display_name?.[0] || participant.username?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    {isUserVerified(participant) && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Connected pulse rings */}
              <div className="absolute inset-0 rounded-full ring-4 ring-green-400/60 animate-ping"></div>
              <div className="absolute inset-0 rounded-full ring-4 ring-emerald-400/40 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            {/* Call info */}
            <div className="mb-8 space-y-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {otherParticipants.length === 1 
                  ? otherParticipants[0].display_name || otherParticipants[0].username
                  : `Group Call (${otherParticipants.length + 1} participants)`
                }
              </h2>
              <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2"></div>
                <span className="text-lg font-medium">{callType} call connected</span>
              </div>
            </div>

            {/* Enhanced call controls */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Button
                variant={isAudioEnabled ? "default" : "destructive"}
                size="lg"
                onClick={toggleAudio}
                className="rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>

              {callType === 'video' && (
                <Button
                  variant={isVideoEnabled ? "default" : "destructive"}
                  size="lg"
                  onClick={toggleVideo}
                  className="rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
              )}
              
              <Button
                variant={isSpeakerEnabled ? "secondary" : "outline"}
                size="lg"
                onClick={toggleSpeaker}
                className="rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                {isSpeakerEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="destructive"
                size="lg"
                onClick={endActiveCall}
                className="rounded-full w-12 h-12 p-0 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <PhoneOff className="w-5 h-5" />
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
        className="text-slate-600 hover:text-purple-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-all duration-200"
      >
        <Phone className="w-5 h-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => startCall('video')}
        className="text-slate-600 hover:text-purple-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-all duration-200"
      >
        <Video className="w-5 h-5" />
      </Button>

      {participants.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => startCall('group')}
          className="text-slate-600 hover:text-purple-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-all duration-200"
        >
          <Users className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

export default RealTimeCallManager;
