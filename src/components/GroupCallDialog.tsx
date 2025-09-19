
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Phone, Video, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { createCall } from '@/services/callService';

interface GroupCallDialogProps {
  groupId: string;
  participants: Array<{
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  }>;
  callType?: 'audio' | 'video';
}

const GroupCallDialog = ({ groupId, participants, callType = 'audio' }: GroupCallDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const startGroupCall = async () => {
    if (!user) return;
    
    try {
      setIsStarting(true);
      
      // Check permissions first
      const constraints = {
        audio: true,
        video: callType === 'video'
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach(track => track.stop()); // Stop test stream
      
      // Create group call in database
      const participantIds = participants.map(p => p.id);
      const call = await createCall(user.id, 'group', participantIds);
      
      // Get caller profile
      const { data: callerProfile } = await supabase
        .from('profiles')
        .select('display_name, username, avatar_url')
        .eq('id', user.id)
        .single();
      
      // Broadcast to all participants
      const broadcastPromises = participants.map(participant => {
        const channel = supabase.channel(`user-calls-${participant.id}`);
        return channel.send({
          type: 'broadcast',
          event: 'incoming-group-call',
          payload: {
            call_id: call.id,
            room_id: call.room_id,
            caller_id: user.id,
            group_id: groupId,
            call_type: callType,
            participants: participantIds,
            caller_profile: {
              display_name: callerProfile?.display_name || callerProfile?.username || 'Unknown User',
              username: callerProfile?.username || 'unknown',
              avatar_url: callerProfile?.avatar_url || null
            }
          }
        });
      });
      
      await Promise.all(broadcastPromises);
      
      toast({
        title: "Group call started",
        description: `${callType} group call initiated with ${participants.length} participants`
      });
      
      setIsOpen(false);
      
      // Navigate to group call room (we'll implement this later)
      const params = new URLSearchParams({
        call: callType,
        room: call.room_id,
        type: 'group'
      });
      
      window.location.href = `/messages?${params.toString()}`;
      
    } catch (error) {
      console.error('Error starting group call:', error);
      
      let errorMessage = 'Failed to start group call';
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
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10">
          {callType === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Start Group {callType === 'video' ? 'Video' : 'Audio'} Call
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Starting a group {callType} call with {participants.length} participants
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
                  {callType === 'video' ? <Video className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                  Start {callType === 'video' ? 'Video' : 'Audio'} Call
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupCallDialog;
