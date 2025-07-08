
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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            {/* User Info */}
            <div className="flex items-center space-x-2 flex-1">
              <Avatar className="w-8 h-8">
                <AvatarImage src={otherUserAvatar} />
                <AvatarFallback className="text-xs">
                  {otherUserName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                  {otherUserName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {duration}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-1">
              {isExpanded && (
                <>
                  <Button
                    variant={isAudioEnabled ? "default" : "destructive"}
                    size="sm"
                    onClick={onToggleAudio}
                    className="w-8 h-8 p-0"
                  >
                    {isAudioEnabled ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                  </Button>
                  
                  {callType === 'video' && (
                    <Button
                      variant={isVideoEnabled ? "default" : "destructive"}
                      size="sm"
                      onClick={onToggleVideo}
                      className="w-8 h-8 p-0"
                    >
                      {isVideoEnabled ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
                    </Button>
                  )}
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-8 h-8 p-0"
              >
                <Maximize2 className="w-3 h-3" />
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={onEndCall}
                className="w-8 h-8 p-0"
              >
                <PhoneOff className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MinimizedCallWidget;
