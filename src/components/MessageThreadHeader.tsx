
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Video } from 'lucide-react';
import { GroupOptionsMenu } from './GroupOptionsMenu';
import { useAuth } from '@/contexts/AuthContext';

interface MessageThreadHeaderProps {
  otherParticipant?: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  conversation?: {
    streak_count?: number;
  };
  groupConversation?: {
    id: string;
    name: string;
    description?: string;
    member_count?: number;
    created_by?: string;
    settings?: any;
    invite_code?: string;
    members?: Array<{ id: string; username: string; display_name: string; avatar_url: string; role: string; joined_at: string; }>;
  };
  isGroupConversation?: boolean;
  onAudioCall: () => void;
  onVideoCall: () => void;
  onGroupUpdated?: () => void;
}

const MessageThreadHeader = ({ 
  otherParticipant, 
  conversation,
  groupConversation,
  isGroupConversation = false, 
  onAudioCall, 
  onVideoCall,
  onGroupUpdated 
}: MessageThreadHeaderProps) => {
  const { user } = useAuth();
  
  const isGroupAdmin = groupConversation && (
    groupConversation.created_by === user?.id ||
    groupConversation.members?.some(m => m.id === user?.id && m.role === 'admin')
  );
  return (
    <div className="border-b border-purple-200 dark:border-purple-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isGroupConversation ? (
            <>
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">#</span>
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  {groupConversation?.name || 'Group Chat'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {groupConversation?.member_count} members
                </p>
              </div>
            </>
          ) : (
            <>
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherParticipant?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {(otherParticipant?.display_name || otherParticipant?.username || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  {otherParticipant?.display_name || otherParticipant?.username}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  @{otherParticipant?.username}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {!isGroupConversation ? (
            <>
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
            </>
          ) : groupConversation ? (
            <GroupOptionsMenu
              groupId={groupConversation.id}
              groupName={groupConversation.name}
              groupDescription={groupConversation.description}
              groupSettings={groupConversation.settings}
              inviteCode={groupConversation.invite_code}
              isAdmin={!!isGroupAdmin}
              members={groupConversation.members || []}
              onGroupDissolved={onGroupUpdated}
              onGroupUpdated={onGroupUpdated}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-2">
        {!isGroupConversation && conversation?.streak_count && conversation.streak_count > 0 ? (
          <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
            🔥 {conversation.streak_count} day streak
          </Badge>
        ) : !isGroupConversation ? (
          <span className="text-xs text-slate-500 dark:text-slate-400">no streak</span>
        ) : (
          <span className="text-xs text-slate-500 dark:text-slate-400">{groupConversation?.description || ''}</span>
        )}
      </div>
    </div>
  );
};

export default MessageThreadHeader;
