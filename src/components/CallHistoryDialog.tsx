
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
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, RefreshCw } from 'lucide-react';
import { useCallHistory } from '@/hooks/useCallHistory';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

const CallHistoryDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { callHistory, loading, refetch } = useCallHistory();
  const { user } = useAuth();

  const handleRefresh = () => {
    refetch();
  };

  const getCallIcon = (callType: string, callStatus: string, isOutgoing: boolean) => {
    if (callStatus === 'missed') {
      return <PhoneMissed className="w-4 h-4 text-red-500" />;
    }
    
    if (callType === 'video') {
      return <Video className="w-4 h-4 text-blue-500" />;
    }
    
    return isOutgoing ? 
      <PhoneOutgoing className="w-4 h-4 text-green-500" /> : 
      <PhoneIncoming className="w-4 h-4 text-blue-500" />;
  };

  const getCallTypeIcon = (callType: string) => {
    return callType === 'video' ? 
      <Video className="w-4 h-4 text-blue-500" /> : 
      <Phone className="w-4 h-4 text-green-500" />;
  };

  const getCallStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', label: 'Completed' },
      missed: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', label: 'Missed' },
      declined: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', label: 'Declined' },
      failed: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', label: 'Failed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.failed;

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds || seconds === 0) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <History className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Call History
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-slate-500 text-lg">Loading call history...</p>
            </div>
          ) : callHistory.length > 0 ? (
            <div className="space-y-3">
              {callHistory.map((call) => {
                const isOutgoing = call.caller_id === user?.id;
                const otherUser = isOutgoing ? call.recipient : call.caller;
                
                return (
                  <div key={call.id} className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={otherUser?.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {(otherUser?.display_name || otherUser?.username || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getCallIcon(call.call_type, call.call_status, isOutgoing)}
                          <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {otherUser?.display_name || otherUser?.username || 'Unknown User'}
                          </h3>
                          {getCallTypeIcon(call.call_type)}
                        </div>
                        {getCallStatusBadge(call.call_status)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                          {formatDistanceToNow(new Date(call.started_at), { addSuffix: true })}
                        </p>
                        <p className="text-sm text-slate-500 font-medium">
                          Duration: {formatDuration(call.duration_seconds)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <History className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">
                No call history
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Your call history will appear here once you make or receive calls.
              </p>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CallHistoryDialog;
