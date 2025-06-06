
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useCallSounds } from '@/hooks/useCallSounds';

interface IncomingCallPopupProps {
  callerName: string;
  callerAvatar?: string;
  callType: 'audio' | 'video';
  onAccept: () => void;
  onDecline: () => void;
  isVisible: boolean;
}

const IncomingCallPopup = ({
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onDecline,
  isVisible
}: IncomingCallPopupProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { playRinging, stopRinging } = useCallSounds();

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      playRinging();
    } else {
      setIsAnimating(false);
      stopRinging();
    }

    return () => {
      stopRinging();
    };
  }, [isVisible, playRinging, stopRinging]);

  if (!isVisible) return null;

  const handleAccept = () => {
    stopRinging();
    onAccept();
  };

  const handleDecline = () => {
    stopRinging();
    onDecline();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md bg-gradient-to-br from-purple-900 via-blue-900 to-black border-white/20 text-white transition-all duration-300 ${
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <CardContent className="p-8 text-center">
          {/* Caller avatar with pulse animation */}
          <div className="relative mb-6">
            <Avatar className="w-24 h-24 mx-auto border-4 border-white/20">
              <AvatarImage src={callerAvatar} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {callerName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping animation-delay-200"></div>
          </div>

          {/* Call info */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">{callerName}</h2>
            <p className="text-lg opacity-75 flex items-center justify-center gap-2">
              {callType === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
              Incoming {callType} call
            </p>
          </div>

          {/* Call actions */}
          <div className="flex items-center justify-center space-x-8">
            <Button
              variant="destructive"
              size="lg"
              onClick={handleDecline}
              className="rounded-full w-16 h-16 p-0 bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="w-8 h-8" />
            </Button>
            
            <Button
              variant="default"
              size="lg"
              onClick={handleAccept}
              className="rounded-full w-16 h-16 p-0 bg-green-500 hover:bg-green-600"
            >
              {callType === 'video' ? <Video className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
            </Button>
          </div>

          <p className="text-sm opacity-50 mt-4">
            Swipe up to accept • Swipe down to decline
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomingCallPopup;
