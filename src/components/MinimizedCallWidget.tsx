
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Maximize2, 
  PhoneOff, 
  Mic, 
  MicOff,
  Video,
  VideoOff
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
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - offsetX,
        y: e.clientY - offsetY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const widget = (
    <Card 
      className={`fixed bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-white/20 dark:border-slate-700/40 shadow-2xl cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{ 
        left: position.x, 
        top: position.y,
        zIndex: 999999998,
        minWidth: '280px'
      }}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Drag handle and avatar */}
          <div 
            className="flex items-center gap-2 flex-1 cursor-grab"
            onMouseDown={handleMouseDown}
          >
            <Avatar className="w-10 h-10 ring-2 ring-white/20 dark:ring-slate-700/40">
              <AvatarImage src={otherUserAvatar} />
              <AvatarFallback className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {otherUserName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {otherUserName}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span>{duration}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant={isAudioEnabled ? "ghost" : "destructive"}
              size="sm"
              onClick={onToggleAudio}
              className="w-8 h-8 p-0 rounded-full"
            >
              {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>

            {callType === 'video' && (
              <Button
                variant={isVideoEnabled ? "ghost" : "destructive"}
                size="sm"
                onClick={onToggleVideo}
                className="w-8 h-8 p-0 rounded-full"
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onMaximize}
              className="w-8 h-8 p-0 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={onEndCall}
              className="w-8 h-8 p-0 rounded-full"
            >
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render the widget in a portal to ensure it's above everything
  return createPortal(widget, document.body);
};

export default MinimizedCallWidget;
