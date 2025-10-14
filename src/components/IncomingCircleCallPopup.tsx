import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IncomingCircleCallPopupProps {
  callId: string;
  callerId: string;
  circleName: string;
  circleId: string;
  roomId: string;
  callType: 'audio' | 'video';
  callerProfile: {
    display_name: string;
    username: string;
    avatar_url: string | null;
  };
  memberCount: number;
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCircleCallPopup = ({
  callId,
  callerId,
  circleName,
  circleId,
  roomId,
  callType,
  callerProfile,
  memberCount,
  onAccept,
  onDecline,
}: IncomingCircleCallPopupProps) => {
  const navigate = useNavigate();

  const handleAccept = () => {
    onAccept();
    
    // Navigate to circle call with proper params
    const params = new URLSearchParams({
      call: callType,
      room: roomId,
      type: 'circle',
      circleId: circleId
    });
    
    navigate(`/circles/call?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-blue-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in duration-300">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse" />
        
        <div className="relative p-8 text-center space-y-6">
          {/* Circle icon */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-2xl animate-pulse" />
              <div className="relative bg-primary/10 p-4 rounded-full ring-4 ring-primary/30">
                <Users className="w-12 h-12 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          {/* Caller info */}
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <Avatar className="h-16 w-16 ring-4 ring-white/30">
                <AvatarImage src={callerProfile.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl">
                  {callerProfile.display_name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <h2 className="text-2xl font-bold text-white">
              {callerProfile.display_name}
            </h2>
            <p className="text-white/60 text-sm">@{callerProfile.username}</p>
          </div>

          {/* Circle info */}
          <div className="bg-white/10 rounded-xl p-4 space-y-2 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 text-white">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-semibold">{circleName}</span>
            </div>
            <p className="text-white/60 text-sm">
              Circle {callType} call with {memberCount} members
            </p>
          </div>

          {/* Ringing animation */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-ping" />
            <span className="text-white/80 text-sm font-medium">Incoming Call...</span>
            <div className="w-3 h-3 bg-primary rounded-full animate-ping animation-delay-150" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              onClick={onDecline}
              size="lg"
              className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700 shadow-xl hover:shadow-red-600/50 transition-all"
            >
              <PhoneOff className="w-7 h-7" />
            </Button>
            
            <Button
              onClick={handleAccept}
              size="lg"
              className="rounded-full w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-2xl hover:shadow-green-600/50 transition-all animate-pulse"
            >
              <Phone className="w-9 h-9" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCircleCallPopup;
