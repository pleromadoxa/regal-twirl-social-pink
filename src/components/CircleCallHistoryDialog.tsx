import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, Clock, Users } from 'lucide-react';
import { useCircleCallHistory } from '@/hooks/useCircleCallHistory';
import { format } from 'date-fns';

interface CircleCallHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circleId: string;
  circleName: string;
}

const CircleCallHistoryDialog = ({
  open,
  onOpenChange,
  circleId,
  circleName,
}: CircleCallHistoryDialogProps) => {
  const { callHistory, loading } = useCircleCallHistory(circleId);

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'Not answered';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{circleName} Call History</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Loading call history...
            </div>
          ) : callHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Phone className="w-12 h-12 mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No call history yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Start your first circle call!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {callHistory.map((call) => (
                <div
                  key={call.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <Avatar className="w-10 h-10 mt-1">
                    <AvatarImage src={call.caller_profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {call.caller_profile?.display_name?.[0] ||
                        call.caller_profile?.username?.[0] ||
                        'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {call.caller_profile?.display_name ||
                          call.caller_profile?.username ||
                          'Unknown User'}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          call.status === 'ended'
                            ? 'bg-green-500/10 text-green-500'
                            : call.status === 'missed'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}
                      >
                        {call.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(call.started_at), 'MMM d, h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{call.participants.length} participants</span>
                      </div>
                    </div>

                    {call.ended_at && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Duration: {formatDuration(call.duration_seconds)}
                      </div>
                    )}
                  </div>

                  <Phone
                    className={`w-4 h-4 mt-1 ${
                      call.call_type === 'audio' ? 'text-primary' : 'text-blue-500'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CircleCallHistoryDialog;
