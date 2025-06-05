
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GroupCreationDialogProps {
  onCreateGroup: (groupName: string, participantIds: string[]) => Promise<string | undefined>;
  trigger?: React.ReactNode;
}

const GroupCreationDialog = ({ onCreateGroup, trigger }: GroupCreationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipantId, setNewParticipantId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddParticipant = () => {
    if (newParticipantId.trim() && !participants.includes(newParticipantId.trim())) {
      setParticipants([...participants, newParticipantId.trim()]);
      setNewParticipantId('');
    }
  };

  const handleRemoveParticipant = (participantId: string) => {
    setParticipants(participants.filter(id => id !== participantId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group",
        variant: "destructive"
      });
      return;
    }

    if (participants.length === 0) {
      toast({
        title: "Participants required",
        description: "Please add at least one participant",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const conversationId = await onCreateGroup(groupName.trim(), participants);
      if (conversationId) {
        setOpen(false);
        setGroupName('');
        setParticipants([]);
        setNewParticipantId('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="rounded-full">
            <Users className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Add Participants</Label>
            <div className="flex gap-2">
              <Input
                value={newParticipantId}
                onChange={(e) => setNewParticipantId(e.target.value)}
                placeholder="Enter user ID..."
                className="flex-1 rounded-2xl"
                onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
              />
              <Button 
                onClick={handleAddParticipant}
                variant="outline"
                className="rounded-2xl"
              >
                Add
              </Button>
            </div>
          </div>

          {participants.length > 0 && (
            <div className="space-y-2">
              <Label>Participants ({participants.length})</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {participants.map((participantId) => (
                  <div key={participantId} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                    <span className="text-sm font-mono">{participantId}</span>
                    <Button
                      onClick={() => handleRemoveParticipant(participantId)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={handleCreateGroup}
            disabled={loading || !groupName.trim() || participants.length === 0}
            className="w-full rounded-2xl bg-purple-600 hover:bg-purple-700"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupCreationDialog;
