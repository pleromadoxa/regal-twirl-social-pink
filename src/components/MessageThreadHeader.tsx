
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Video, MoreVertical } from 'lucide-react';

interface MessageThreadHeaderProps {
  otherParticipant: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  conversation: {
    streak_count?: number;
  };
  onAudioCall: () => void;
  onVideoCall: () => void;
}

const MessageThreadHeader = ({ 
  otherParticipant, 
  conversation, 
  onAudioCall, 
  onVideoCall 
}: MessageThreadHeaderProps) => {
  return (
    <div className="border-b border-purple-200 dark:border-purple-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherParticipant.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {(otherParticipant.display_name || otherParticipant.username || 'U')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              {otherParticipant.display_name || otherParticipant.username}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              @{otherParticipant.username}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAudioCall}
            className="rounded-full"
          >
            <Phone className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onVideoCall}
            className="rounded-full"
          >
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mt-2">
        {conversation.streak_count && conversation.streak_count > 0 ? (
          <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
            🔥 {conversation.streak_count} day streak
          </Badge>
        ) : (
          <span className="text-xs text-slate-500 dark:text-slate-400">no streak</span>
        )}
      </div>
    </div>
  );
};

export default MessageThreadHeader;
