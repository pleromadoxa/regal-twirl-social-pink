
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video } from 'lucide-react';

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
  // Component maintained for UI compatibility but no call functionality
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white dark:bg-slate-800 shadow-2xl border-0 w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <Avatar className="w-24 h-24 mx-auto border-4 border-white/20">
              <AvatarImage src={callerAvatar} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {callerName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {callerName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
              {callType === 'video' ? (
                <>
                  <Video className="w-4 h-4" />
                  Incoming video call
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  Incoming audio call
                </>
              )}
            </p>
          </div>

          <div className="flex justify-center space-x-6">
            <Button
              variant="destructive"
              size="lg"
              onClick={onDecline}
              className="rounded-full w-14 h-14 p-0"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
            
            <Button
              variant="default"
              size="lg"
              onClick={onAccept}
              className="rounded-full w-14 h-14 p-0 bg-green-500 hover:bg-green-600"
            >
              {callType === 'video' ? (
                <Video className="w-6 h-6" />
              ) : (
                <Phone className="w-6 h-6" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomingCallPopup;
