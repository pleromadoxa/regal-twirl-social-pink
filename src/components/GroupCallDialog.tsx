
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Video, Phone, X, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GroupCallDialogProps {
  participants: Array<{
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  }>;
}

const GroupCallDialog = ({ participants }: GroupCallDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [callType, setCallType] = useState<'audio' | 'video'>('video');
  const { user } = useAuth();
  const { toast } = useToast();

  const filteredParticipants = participants.filter(p => 
    p.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId) 
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const startGroupCall = async () => {
    if (selectedParticipants.length === 0) {
      toast({
        title: "No participants selected",
        description: "Please select at least one participant for the group call",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a group call room
      const roomId = `group-call-${Date.now()}`;
      
      // Notify all selected participants
      const channel = supabase.channel(`group-call-initiation-${roomId}`);
      
      await channel.subscribe();
      
      // Send group call invitation to all participants
      selectedParticipants.forEach(participantId => {
        channel.send({
          type: 'broadcast',
          event: 'group-call-invitation',
          payload: {
            room_id: roomId,
            initiator_id: user?.id,
            initiator_name: user?.user_metadata?.display_name || user?.email,
            initiator_avatar: user?.user_metadata?.avatar_url,
            call_type: callType,
            participant_ids: selectedParticipants,
            recipient_id: participantId
          }
        });
      });

      toast({
        title: "Group call started",
        description: `Invited ${selectedParticipants.length} participants to join`
      });

      setIsOpen(false);
      setSelectedParticipants([]);
      
      supabase.removeChannel(channel);
    } catch (error) {
      console.error('Error starting group call:', error);
      toast({
        title: "Failed to start group call",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="rounded-full">
          <Users className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Start Group Call
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Call type selection */}
          <div className="flex gap-2">
            <Button
              variant={callType === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCallType('video')}
              className="flex-1"
            >
              <Video className="w-4 h-4 mr-2" />
              Video Call
            </Button>
            <Button
              variant={callType === 'audio' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCallType('audio')}
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-2" />
              Audio Call
            </Button>
          </div>

          {/* Search participants */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search participants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected participants */}
          {selectedParticipants.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Selected ({selectedParticipants.length})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedParticipants([])}
                >
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedParticipants.map(id => {
                  const participant = participants.find(p => p.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      {participant?.display_name || participant?.username}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => toggleParticipant(id)}
                      />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Participants list */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredParticipants.map((participant) => (
              <div
                key={participant.id}
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedParticipants.includes(participant.id)
                    ? 'bg-purple-100 dark:bg-purple-900/20'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => toggleParticipant(participant.id)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={participant.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                    {(participant.display_name || participant.username)[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{participant.display_name || participant.username}</p>
                  <p className="text-xs text-slate-500">@{participant.username}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Start call button */}
          <Button
            onClick={startGroupCall}
            disabled={selectedParticipants.length === 0}
            className="w-full"
          >
            Start {callType === 'video' ? 'Video' : 'Audio'} Call
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupCallDialog;
