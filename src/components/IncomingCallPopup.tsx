
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IncomingCallPopupProps {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'audio' | 'video';
  onAccept: () => void;
  onDecline: () => void;
  isVisible: boolean;
}

const IncomingCallPopup = ({
  callId,
  callerId,
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onDecline,
  isVisible
}: IncomingCallPopupProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRinging, setIsRinging] = useState(true);

  useEffect(() => {
    let ringTimeout: NodeJS.Timeout;
    
    if (isVisible && isRinging) {
      // Auto-decline after 30 seconds
      ringTimeout = setTimeout(() => {
        handleDecline();
      }, 30000);
    }

    return () => {
      if (ringTimeout) {
        clearTimeout(ringTimeout);
      }
    };
  }, [isVisible, isRinging]);

  const handleAccept = async () => {
    if (!user) return;
    
    try {
      // Join the call in database
      const { error } = await supabase
        .from('active_calls')
        .update({
          participants: [callerId, user.id]
        })
        .eq('id', callId);

      if (error) throw error;

      setIsRinging(false);
      onAccept();
      
      toast({
        title: "Call connected",
        description: `Connected to ${callType} call with ${callerName}`
      });
    } catch (error) {
      console.error('Error accepting call:', error);
      toast({
        title: "Error",
        description: "Failed to accept call",
        variant: "destructive"
      });
    }
  };

  const handleDecline = async () => {
    try {
      // End the call in database
      await supabase
        .from('active_calls')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', callId);

      setIsRinging(false);
      onDecline();
      
      toast({
        title: "Call declined",
        description: `Declined ${callType} call from ${callerName}`
      });
    } catch (error) {
      console.error('Error declining call:', error);
    }
  };

  if (!isVisible || !isRinging) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-96 bg-white dark:bg-slate-800 shadow-2xl animate-in zoom-in-95 duration-300">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Caller Info */}
            <div className="space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24 mx-auto ring-4 ring-white dark:ring-slate-600 shadow-lg">
                  <AvatarImage src={callerAvatar} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                    {callerName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {callType === 'video' ? 'Video Call' : 'Audio Call'}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {callerName}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 animate-pulse">
                  Incoming {callType} call...
                </p>
              </div>
            </div>

            {/* Call Actions */}
            <div className="flex justify-center gap-8">
              <Button
                onClick={handleDecline}
                size="lg"
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
              
              <Button
                onClick={handleAccept}
                size="lg"
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {callType === 'video' ? (
                  <Video className="w-6 h-6" />
                ) : (
                  <Phone className="w-6 h-6" />
                )}
              </Button>
            </div>

            {/* Decline/Accept Labels */}
            <div className="flex justify-center gap-8 text-sm text-slate-500 dark:text-slate-400">
              <span>Decline</span>
              <span>Accept</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomingCallPopup;
