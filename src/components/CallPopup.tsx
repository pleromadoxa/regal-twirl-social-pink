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
    <div className="fixed top-4 right-4 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-purple-200 dark:border-purple-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="p-6 space-y-4">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarImage src={otherUser.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {(otherUser.display_name || otherUser.username)[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {otherUser.display_name || otherUser.username}
              </h3>
              {otherUser.is_verified && <Badge variant="secondary" className="text-xs">✓</Badge>}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{otherUser.username}
            </p>
            {otherUserLocation && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <MapPin className="w-3 h-3" />
                <span>{formatLocation(otherUserLocation)}</span>
              </div>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {callType === 'video' ? <Video className="w-3 h-3 mr-1" /> : <Phone className="w-3 h-3 mr-1" />}
            {callType}
          </Badge>
        </div>

        {/* Status */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getStatusText()}
          </p>
          {status === 'ringing' && (
            <div className="flex justify-center mt-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex justify-center space-x-3">
          {isIncoming && status === 'ringing' ? (
            // Incoming call buttons
            <>
              <Button
                onClick={onDecline}
                variant="destructive"
                size="sm"
                className="rounded-full w-12 h-12 p-0"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
              <Button
                onClick={onAccept}
                className="rounded-full w-12 h-12 p-0 bg-green-500 hover:bg-green-600"
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
                  className="rounded-full w-10 h-10 p-0"
                >
                  {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
              )}
              {onToggleMute && (
                <Button
                  onClick={onToggleMute}
                  variant={isMuted ? "destructive" : "secondary"}
                  size="sm"
                  className="rounded-full w-10 h-10 p-0"
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}
              <Button
                onClick={onDecline}
                variant="destructive"
                size="sm"
                className="rounded-full w-10 h-10 p-0"
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