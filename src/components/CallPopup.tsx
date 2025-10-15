import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, MapPin } from 'lucide-react';
import VerificationBadge from '@/components/VerificationBadge';
import { useUserLocationContext } from '@/contexts/UserLocationContext';
import { formatLocation } from '@/services/locationService';

interface CallPopupProps {
  isIncoming: boolean;
  callType: 'audio' | 'video';
  otherUser: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
  onAccept: () => void;
  onDecline: () => void;
  onToggleMute?: () => void;
  onToggleVideo?: () => void;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
  duration?: number;
  status?: 'connecting' | 'connected' | 'ringing';
}

const CallPopup = ({
  isIncoming,
  callType,
  otherUser,
  onAccept,
  onDecline,
  onToggleMute,
  onToggleVideo,
  isMuted = false,
  isVideoEnabled = true,
  duration = 0,
  status = 'ringing'
}: CallPopupProps) => {
  const [currentDuration, setCurrentDuration] = useState(duration);
  
  // Safely get location context
  let getUserLocation: ((userId: string) => any) | undefined;
  try {
    const locationContext = useUserLocationContext();
    getUserLocation = locationContext.getUserLocation;
  } catch (error) {
    // Location context not available, continue without location features
    console.log('Location context not available');
  }

  const otherUserLocation = getUserLocation ? 
    getUserLocation(otherUser.id) : null;

  useEffect(() => {
    if (status === 'connected') {
      const interval = setInterval(() => {
        setCurrentDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return formatDuration(currentDuration);
      default:
        return isIncoming ? 'Incoming call' : 'Calling...';
    }
  };

  return (
    <div className="fixed inset-x-4 top-4 sm:right-4 sm:left-auto w-auto sm:w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-purple-200 dark:border-purple-700 rounded-2xl shadow-2xl z-[9998] overflow-hidden pointer-events-auto">
      <div className="p-4 sm:p-6 space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <Avatar className="w-12 h-12 sm:w-14 sm:h-14 ring-2 ring-purple-200 dark:ring-purple-700">
              <AvatarImage src={otherUser.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg">
                {(otherUser.display_name || otherUser.username)[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {status === 'connected' && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">
                {otherUser.display_name || otherUser.username}
              </h3>
              {otherUser.is_verified && (
                <VerificationBadge level="verified" showText={false} className="w-4 h-4" />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              @{otherUser.username}
            </p>
            {otherUserLocation && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{formatLocation(otherUserLocation)}</span>
              </div>
            )}
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs gap-1">
            {callType === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
            <span className="hidden sm:inline">{callType}</span>
          </Badge>
        </div>

        {/* Status */}
        <div className="text-center py-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getStatusText()}
          </p>
          {status === 'ringing' && (
            <div className="flex justify-center mt-2">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:200ms]"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:400ms]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex justify-center gap-3">
          {isIncoming && status === 'ringing' ? (
            // Incoming call buttons
            <>
              <Button
                onClick={onDecline}
                variant="destructive"
                size="lg"
                className="rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all"
                aria-label="Decline call"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
              <Button
                onClick={onAccept}
                size="lg"
                className="rounded-full w-14 h-14 p-0 bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all"
                aria-label="Accept call"
              >
                <Phone className="w-5 h-5" />
              </Button>
            </>
          ) : (
            // Active call controls
            <>
              {callType === 'video' && onToggleVideo && (
                <Button
                  onClick={onToggleVideo}
                  variant={isVideoEnabled ? "secondary" : "destructive"}
                  size="sm"
                  className="rounded-full w-11 h-11 p-0 shadow-md"
                  aria-label={isVideoEnabled ? "Turn off video" : "Turn on video"}
                >
                  {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
              )}
              {onToggleMute && (
                <Button
                  onClick={onToggleMute}
                  variant={isMuted ? "destructive" : "secondary"}
                  size="sm"
                  className="rounded-full w-11 h-11 p-0 shadow-md"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}
              <Button
                onClick={onDecline}
                variant="destructive"
                size="sm"
                className="rounded-full w-11 h-11 p-0 shadow-md hover:shadow-lg"
                aria-label="End call"
              >
                <PhoneOff className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallPopup;