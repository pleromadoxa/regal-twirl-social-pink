
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Video, Users, MapPin } from 'lucide-react';
import { GroupOptionsMenu } from './GroupOptionsMenu';
import GroupCallDialog from './GroupCallDialog';
import { useAuth } from '@/contexts/AuthContext';
import PresenceIndicator from './PresenceIndicator';
import { useUserLocation } from '@/hooks/useUserLocation';
import { formatLocation } from '@/services/locationService';

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
  const { getUserLocation } = useUserLocation();
  
  const isGroupAdmin = groupConversation && (
    groupConversation.created_by === user?.id ||
    groupConversation.members?.some(m => m.id === user?.id && m.role === 'admin')
  );

  const otherUserLocation = otherParticipant ? getUserLocation(otherParticipant.id) : null;
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {isGroupConversation ? (
            <>
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">#</span>
              </div>
              <div className="flex-1 text-center">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  {groupConversation?.name || 'Group Chat'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {groupConversation?.member_count} members
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherParticipant?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {(otherParticipant?.display_name || otherParticipant?.username || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <PresenceIndicator userId={otherParticipant?.id} className="absolute -bottom-1 -right-1" />
              </div>
              <div className="flex-1 text-center">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  {otherParticipant?.display_name || otherParticipant?.username}
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <PresenceIndicator userId={otherParticipant?.id} showText />
                  {otherUserLocation && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span>{formatLocation(otherUserLocation)}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {!isGroupConversation && otherParticipant && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAudioCall}
                className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Audio call"
              >
                <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onVideoCall}
                className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Video call"
              >
                <Video className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </Button>
            </>
          )}
          
          {isGroupConversation && groupConversation && (
            <GroupOptionsMenu
              groupId={groupConversation.id}
              groupName={groupConversation.name}
              groupDescription={groupConversation.description}
              groupSettings={groupConversation.settings}
              inviteCode={groupConversation.invite_code}
              isAdmin={isGroupAdmin}
              members={groupConversation.members || []}
              onGroupDissolved={onGroupUpdated}
              onGroupUpdated={onGroupUpdated}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageThreadHeader;
