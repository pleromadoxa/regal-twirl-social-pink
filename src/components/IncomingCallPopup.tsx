import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video, Mic, Users, MapPin } from 'lucide-react';
import { useCallSounds } from '@/hooks/useCallSounds';
import { useUserLocationContext } from '@/contexts/UserLocationContext';
import { formatLocation } from '@/services/locationService';

interface IncomingCallPopupProps {
  callId: string;
  callerName: string;
  callerAvatar?: string | null;
  callType: 'audio' | 'video' | 'group';
  callerId?: string;
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCallPopup = ({
  callId,
  callerName,
  callerAvatar,
  callType,
  callerId,
  onAccept,
  onDecline
}: IncomingCallPopupProps) => {
  const { playRinging, stopRinging } = useCallSounds();
  
  // Safely get location context
  let getUserLocation: ((userId: string) => any) | undefined;
  try {
    const locationContext = useUserLocationContext();
    getUserLocation = locationContext.getUserLocation;
  } catch (error) {
    // Location context not available, continue without location features
    console.log('Location context not available');
  }

  const callerLocation = callerId && getUserLocation ? 
    getUserLocation(callerId) : null;

  useEffect(() => {
    // Start playing ringing sound when popup appears
    playRinging();

    // Auto-decline after 30 seconds
    const timer = setTimeout(() => {
      stopRinging();
      onDecline();
    }, 30000);

    return () => {
      clearTimeout(timer);
      stopRinging();
    };
  }, [playRinging, stopRinging, onDecline]);

  const handleAccept = () => {
    stopRinging();
    onAccept();
  };

  const handleDecline = () => {
    stopRinging();
    onDecline();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 pointer-events-auto">
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-black rounded-2xl p-8 text-white shadow-2xl border border-white/10 max-w-sm w-full mx-auto animate-in zoom-in-95 pointer-events-auto">
        
        {/* Incoming call indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Incoming {callType === 'group' ? 'group' : callType} call
          </div>
        </div>

        {/* Caller Info */}
        <div className="text-center mb-8">
          <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-white/20">
            <AvatarImage src={callerAvatar || undefined} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
              {callType === 'group' ? <Users className="w-8 h-8" /> : (callerName[0]?.toUpperCase() || 'U')}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-bold mb-1">{callerName}</h2>
          <p className="text-gray-300 text-sm mb-2">
            {callType === 'group' ? 'Group call' : callType === 'video' ? 'Video call' : 'Voice call'}
          </p>
          {callerLocation && (
            <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>Calling from {formatLocation(callerLocation)}</span>
            </div>
          )}
        </div>

        {/* Call Actions */}
        <div className="flex justify-center gap-8">
          {/* Decline Button */}
          <Button
            variant="destructive"
            size="lg"
            onClick={handleDecline}
            className="rounded-full w-16 h-16 p-0 bg-red-500 hover:bg-red-600 shadow-lg"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          {/* Accept Button */}
          <Button
            variant="default"
            size="lg" 
            onClick={handleAccept}
            className="rounded-full w-16 h-16 p-0 bg-green-500 hover:bg-green-600 shadow-lg"
          >
            {callType === 'group' ? (
              <Users className="w-6 h-6" />
            ) : callType === 'video' ? (
              <Video className="w-6 h-6" />
            ) : (
              <Phone className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Call ID for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            Call ID: {callId}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomingCallPopup;