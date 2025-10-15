
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Video, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PresenceIndicator from './PresenceIndicator';
import { useUserLocationContext } from '@/contexts/UserLocationContext';
import { formatLocation } from '@/services/locationService';
import { useNavigate } from 'react-router-dom';

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
  onAudioCall: () => void;
  onVideoCall: () => void;
}

const MessageThreadHeader = ({ 
  otherParticipant, 
  conversation,
  onAudioCall, 
  onVideoCall,
}: MessageThreadHeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Safely get location context
  let getUserLocation: ((userId: string) => any) | undefined;
  try {
    const locationContext = useUserLocationContext();
    getUserLocation = locationContext.getUserLocation;
  } catch (error) {
    // Location context not available, continue without location features
    console.log('Location context not available');
  }

  const otherUserLocation = otherParticipant && getUserLocation ? 
    getUserLocation(otherParticipant.id) : null;

  const handleProfileClick = () => {
    if (otherParticipant) {
      navigate(`/profile/${otherParticipant.id}`);
    }
  };
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative flex items-center space-x-3">
            <Avatar 
              className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleProfileClick}
            >
              <AvatarImage src={otherParticipant?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {(otherParticipant?.display_name || otherParticipant?.username || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <PresenceIndicator userId={otherParticipant?.id} className="absolute -bottom-1 -right-1" />
            
            <div 
              className="flex-1 cursor-pointer hover:bg-accent/20 rounded-md p-1 -m-1 transition-colors"
              onClick={handleProfileClick}
            >
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                {otherParticipant?.display_name || otherParticipant?.username}
              </h2>
              <div className="flex items-center gap-2">
                <PresenceIndicator userId={otherParticipant?.id} showText />
                {otherUserLocation && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{formatLocation(otherUserLocation)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {otherParticipant && (
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
        </div>
      </div>
    </div>
  );
};

export default MessageThreadHeader;
