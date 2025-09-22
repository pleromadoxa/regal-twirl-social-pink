
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Maximize2 
} from 'lucide-react';

interface MinimizedCallWidgetProps {
  otherUserName: string;
  otherUserAvatar?: string;
  callType: 'audio' | 'video';
  duration: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onMaximize: () => void;
  onEndCall: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

const MinimizedCallWidget = ({
  otherUserName,
  otherUserAvatar,
  callType,
  duration,
  isAudioEnabled,
  isVideoEnabled,
  onMaximize,
  onEndCall,
  onToggleAudio,
  onToggleVideo
}: MinimizedCallWidgetProps) => {
  return (
    <Card className="fixed bottom-20 right-4 z-50 w-80 bg-card/95 backdrop-blur-sm border shadow-lg animate-slide-in-right">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 animate-pulse">
              <AvatarImage src={otherUserAvatar} />
              <AvatarFallback>{otherUserName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{otherUserName}</p>
              <p className="text-xs text-muted-foreground">
                {duration}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Toggle Audio */}
            <Button
              variant={isAudioEnabled ? "secondary" : "destructive"}
              size="sm"
              onClick={onToggleAudio}
              className="rounded-full w-8 h-8 p-0 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              {isAudioEnabled ? (
                <Mic className="w-4 h-4 transition-transform duration-200" />
              ) : (
                <MicOff className="w-4 h-4 transition-transform duration-200" />
              )}
            </Button>

            {/* Toggle Video (for video calls) */}
            {callType === 'video' && (
              <Button
                variant={isVideoEnabled ? "secondary" : "destructive"}
                size="sm"
                onClick={onToggleVideo}
                className="rounded-full w-8 h-8 p-0 transition-all duration-200 hover:scale-110 active:scale-95"
              >
                {isVideoEnabled ? (
                  <Video className="w-4 h-4 transition-transform duration-200" />
                ) : (
                  <VideoOff className="w-4 h-4 transition-transform duration-200" />
                )}
              </Button>
            )}

            {/* Maximize */}
            <Button
              variant="outline"
              size="sm"
              onClick={onMaximize}
              className="rounded-full w-8 h-8 p-0 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <Maximize2 className="w-4 h-4 transition-transform duration-200" />
            </Button>

            {/* End Call */}
            <Button
              variant="destructive"
              size="sm"
              onClick={onEndCall}
              className="rounded-full w-8 h-8 p-0 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <PhoneOff className="w-4 h-4 transition-transform duration-200" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MinimizedCallWidget;
