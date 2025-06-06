
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock } from 'lucide-react';
import { useCallHistory } from '@/hooks/useCallHistory';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

const CallHistorySection = () => {
  const { callHistory, loading } = useCallHistory();
  const { user } = useAuth();
  const [showAll, setShowAll] = useState(false);

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

  const getCallStatusBadge = (status: string) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      missed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      declined: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      failed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.failed}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const displayedCalls = showAll ? callHistory : callHistory.slice(0, 5);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    );
  }

  if (callHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No call history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Calls</h3>
        {callHistory.length > 5 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All (${callHistory.length})`}
          </Button>
        )}
      </div>
      
      {displayedCalls.map((call) => {
        const isOutgoing = call.caller_id === user?.id;
        const otherUser = isOutgoing ? call.recipient_profile : call.caller_profile;
        
        return (
          <Card key={call.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherUser?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                    {(otherUser?.display_name || otherUser?.username || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCallIcon(call.call_type, call.call_status, isOutgoing)}
                      <span className="font-medium text-slate-900 dark:text-slate-100 truncate text-sm">
                        {otherUser?.display_name || otherUser?.username || 'Unknown User'}
                      </span>
                    </div>
                    {getCallStatusBadge(call.call_status)}
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(call.started_at), { addSuffix: true })}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDuration(call.duration_seconds)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CallHistorySection;
