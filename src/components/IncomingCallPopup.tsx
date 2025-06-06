
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Video, CheckCircle } from 'lucide-react';
import { useCallSounds } from '@/hooks/useCallSounds';

interface IncomingCallPopupProps {
  callerName: string;
  callerAvatar?: string;
  callType: 'audio' | 'video';
  onAccept: () => void;
  onDecline: () => void;
  isVisible: boolean;
  isVerified?: boolean;
}

const IncomingCallPopup = ({
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onDecline,
  isVisible,
  isVerified = false
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl transition-all duration-500 ${
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <CardContent className="p-8 text-center">
          {/* Caller avatar with enhanced pulse animation */}
          <div className="relative mb-8">
            <div className="relative">
              <Avatar className="w-28 h-28 mx-auto ring-4 ring-white/20 dark:ring-slate-700/40 shadow-xl">
                <AvatarImage src={callerAvatar} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 text-white font-semibold">
                  {callerName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Multiple pulse rings with different delays */}
              <div className="absolute inset-0 rounded-full ring-4 ring-purple-400/60 animate-ping"></div>
              <div className="absolute inset-0 rounded-full ring-4 ring-blue-400/40 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-0 rounded-full ring-4 ring-pink-400/30 animate-ping" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          {/* Caller info with verified badge */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{callerName}</h2>
              {isVerified && (
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
              {callType === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
              <span className="text-lg font-medium">
                Incoming {callType} call
              </span>
            </div>
            
            <div className="w-16 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full mx-auto"></div>
          </div>

          {/* Enhanced call actions */}
          <div className="flex items-center justify-center space-x-12">
            <Button
              variant="outline"
              size="lg"
              onClick={handleDecline}
              className="rounded-full w-16 h-16 p-0 border-2 border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <PhoneOff className="w-7 h-7" />
            </Button>
            
            <Button
              size="lg"
              onClick={handleAccept}
              className="rounded-full w-16 h-16 p-0 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-white"
            >
              {callType === 'video' ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
            </Button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 font-medium">
            Tap to answer • Swipe to decline
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomingCallPopup;
