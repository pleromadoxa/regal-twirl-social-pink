import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Volume2, 
  VolumeX,
  MoreVertical,
  Monitor,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EnhancedCallControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isSpeakerEnabled: boolean;
  callType: 'audio' | 'video';
  status: 'idle' | 'connecting' | 'connected' | 'ended' | 'failed';
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
  onScreenShare?: () => void;
  onAnswer?: () => void;
  isIncoming?: boolean;
  isScreenSharing?: boolean;
}

export const EnhancedCallControls = ({
  isAudioEnabled,
  isVideoEnabled,
  isSpeakerEnabled,
  callType,
  status,
  onToggleAudio,
  onToggleVideo,
  onToggleSpeaker,
  onEndCall,
  onScreenShare,
  onAnswer,
  isIncoming = false,
  isScreenSharing = false
}: EnhancedCallControlsProps) => {
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const isCallActive = status === 'connected';
  const canUseControls = isCallActive || (isIncoming && status === 'idle');

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 bg-black/50 backdrop-blur-md rounded-full px-4 sm:px-6 py-3 sm:py-4 max-w-fit mx-auto overflow-x-auto">
      {/* Audio Control */}
      <Button
        variant={isAudioEnabled ? "secondary" : "destructive"}
        size="lg"
        onClick={onToggleAudio}
        className="rounded-full w-14 h-14 p-0"
        disabled={!canUseControls}
      >
        {isAudioEnabled ? (
          <Mic className="w-6 h-6" />
        ) : (
          <MicOff className="w-6 h-6" />
        )}
      </Button>

      {/* Video Control (for video calls) */}
      {callType === 'video' && (
        <Button
          variant={isVideoEnabled ? "secondary" : "destructive"}
          size="lg"
          onClick={onToggleVideo}
          className="rounded-full w-14 h-14 p-0"
          disabled={!canUseControls}
        >
          {isVideoEnabled ? (
            <Video className="w-6 h-6" />
          ) : (
            <VideoOff className="w-6 h-6" />
          )}
        </Button>
      )}

      {/* Answer/End Call Buttons */}
      {isIncoming && status === 'idle' ? (
        <div className="flex gap-4">
          <Button
            variant="default"
            size="lg"
            onClick={onAnswer}
            className="rounded-full w-14 h-14 p-0 bg-green-500 hover:bg-green-600"
          >
            {callType === 'video' ? (
              <Video className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </Button>
          <Button
            variant="destructive"
            size="lg"
            onClick={onEndCall}
            className="rounded-full w-14 h-14 p-0"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      ) : (
        <Button
          variant="destructive"
          size="lg"
          onClick={onEndCall}
          className="rounded-full w-14 h-14 p-0"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      )}

      {/* Speaker Control */}
      <Button
        variant={isSpeakerEnabled ? "secondary" : "outline"}
        size="lg"
        onClick={onToggleSpeaker}
        className="rounded-full w-14 h-14 p-0"
        disabled={!canUseControls}
      >
        {isSpeakerEnabled ? (
          <Volume2 className="w-6 h-6" />
        ) : (
          <VolumeX className="w-6 h-6" />
        )}
      </Button>

      {/* More Options */}
      <DropdownMenu open={showMoreOptions} onOpenChange={setShowMoreOptions}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-14 h-14 p-0"
            disabled={!isCallActive}
          >
            <MoreVertical className="w-6 h-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="top" className="mb-2">
          {callType === 'video' && onScreenShare && (
            <DropdownMenuItem onClick={onScreenShare}>
              <Monitor className="w-4 h-4 mr-2" />
              {isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <Settings className="w-4 h-4 mr-2" />
            Call Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600"
            onClick={onEndCall}
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            End Call
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};