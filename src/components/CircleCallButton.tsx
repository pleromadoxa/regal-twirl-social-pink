import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Mic } from 'lucide-react';
import { useCircles } from '@/hooks/useCircles';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CircleCallButtonProps {
  circleId: string;
  circleName: string;
}

const CircleCallButton = ({ circleId, circleName }: CircleCallButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [participants, setParticipants] = useState<Array<{
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  }>>([]);
  const { getCircleMembers } = useCircles();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleOpenDialog = async (open: boolean) => {
    setIsOpen(open);
    
    if (open && participants.length === 0) {
      setIsLoading(true);
      try {
        const members = await getCircleMembers(circleId);
        
        if (members.length === 0) {
          toast({
            title: "No members",
            description: "This circle has no members to call",
            variant: "destructive"
          });
          setIsOpen(false);
          setIsLoading(false);
          return;
        }

        const formattedParticipants = members.map(member => ({
          id: member.user_id,
          username: member.profiles.username || '',
          display_name: member.profiles.display_name || member.profiles.username || '',
          avatar_url: member.profiles.avatar_url || ''
        }));

        setParticipants(formattedParticipants);
      } catch (error) {
        console.error('Error loading circle members:', error);
        toast({
          title: "Error",
          description: "Failed to load circle members",
          variant: "destructive"
        });
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const startGroupCall = async () => {
    if (!user) return;
    
    try {
      setIsStarting(true);
      
      // Check permissions first
      const constraints = { audio: true, video: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach(track => track.stop()); // Stop test stream
      
      // Generate unique room ID
      const roomId = `circle-${circleId}-${Date.now()}`;
      
      // Create circle call history first
      const participantIds = participants.map(p => p.id);
      const { data: callHistory, error: historyError } = await supabase
        .from('circle_call_history')
        .insert({
          circle_id: circleId,
          caller_id: user.id,
          room_id: roomId,
          call_type: 'audio',
          participants: participantIds,
          status: 'active',
        })
        .select()
        .single();

      if (historyError) throw historyError;

      // Create circle-specific call in database linked to history
      const { data: call, error: callError } = await supabase
        .from('circle_calls')
        .insert({
          circle_id: circleId,
          caller_id: user.id,
          room_id: roomId,
          call_type: 'audio',
          participants: participantIds,
          call_history_id: callHistory.id,
        })
        .select()
        .single();

      if (callError) throw callError;
      
      // Get caller profile
      const { data: callerProfile } = await supabase
        .from('profiles')
        .select('display_name, username, avatar_url')
        .eq('id', user.id)
        .single();
      
      // Broadcast to all participants on their listening channels
      console.log('[CircleCall] Broadcasting to participants:', participantIds);
      
      for (const participant of participants) {
        // Skip the caller
        if (participant.id === user.id) continue;
        
        try {
          // Use the same channel name that WebRTCCallManager is listening to
          const channelName = `user-calls-${participant.id}`;
          console.log(`[CircleCall] Sending to channel: ${channelName}`);
          
          // Get or create the channel
          let channel = supabase.getChannels().find(ch => ch.topic === channelName);
          
          if (!channel) {
            channel = supabase.channel(channelName);
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('Timeout')), 3000);
              
              channel!.subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                  clearTimeout(timeout);
                  resolve();
                } else if (status === 'CHANNEL_ERROR') {
                  clearTimeout(timeout);
                  reject(new Error('Channel error'));
                }
              });
            });
          }
          
          // Send the broadcast
          await channel.send({
            type: 'broadcast',
            event: 'incoming-circle-call',
            payload: {
              call_id: call.id,
              room_id: roomId,
              caller_id: user.id,
              circle_id: circleId,
              circle_name: circleName,
              call_type: 'audio',
              participants: participantIds,
              caller_profile: {
                display_name: callerProfile?.display_name || callerProfile?.username || 'Unknown User',
                username: callerProfile?.username || 'unknown',
                avatar_url: callerProfile?.avatar_url || null
              }
            }
          });
          
          console.log(`[CircleCall] Successfully sent to ${participant.id}`);
        } catch (error) {
          console.error(`[CircleCall] Error sending to ${participant.id}:`, error);
        }
      }
      
      toast({
        title: "Circle call started",
        description: `Audio call initiated with ${participants.length} members from ${circleName}`
      });
      
      setIsOpen(false);
      
      // Navigate to WebRTC call page
      const params = new URLSearchParams({
        circleId: circleId,
        circleName: circleName
      });
      
      window.location.href = `/circles/call-webrtc?${params.toString()}`;
      
    } catch (error) {
      console.error('Error starting circle call:', error);
      
      let errorMessage = 'Failed to start circle call';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Please allow access to your microphone and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone found.';
        }
      }
      
      toast({
        title: "Circle call failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenDialog}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full hover:bg-primary/10"
        >
          <Phone className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Start Circle Audio Call
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Starting an audio call with all {participants.length} members of "{circleName}"
                </p>
                
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {participants.slice(0, 8).map((participant) => (
                    <div key={participant.id} className="flex flex-col items-center space-y-2">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                        <AvatarImage src={participant.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {(participant.display_name || participant.username)[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate w-full text-center">
                        {participant.display_name || `@${participant.username}`}
                      </span>
                    </div>
                  ))}
                  {participants.length > 8 && (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">+{participants.length - 8}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">more</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isStarting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={startGroupCall}
                  disabled={isStarting}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isStarting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Start Audio Call
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CircleCallButton;
