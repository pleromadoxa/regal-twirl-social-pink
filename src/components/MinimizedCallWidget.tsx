
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
    <Card className="fixed bottom-20 right-4 z-50 bg-background/90 backdrop-blur-sm border shadow-lg">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherUserAvatar} />
            <AvatarFallback>{otherUserName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{otherUserName}</p>
            <p className="text-xs text-muted-foreground">{duration}</p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleAudio}
              className="h-8 w-8 p-0"
            >
              {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            
            {callType === 'video' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleVideo}
                className="h-8 w-8 p-0"
              >
                {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onMaximize}
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={onEndCall}
              className="h-8 w-8 p-0"
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MinimizedCallWidget;
