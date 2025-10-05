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
  const [buttonStates, setButtonStates] = useState({
    audioPressed: false,
    videoPressed: false,
    speakerPressed: false
  });

  // Allow controls during connecting, connected, and incoming states
  const canUseControls = status === 'connected' || status === 'connecting' || (isIncoming && status === 'idle');
  
  const handleAudioToggle = () => {
    console.log('[EnhancedCallControls] Audio toggle clicked, current state:', isAudioEnabled);
    setButtonStates(prev => ({ ...prev, audioPressed: true }));
    setTimeout(() => setButtonStates(prev => ({ ...prev, audioPressed: false })), 150);
    onToggleAudio();
  };

  const handleVideoToggle = () => {
    console.log('[EnhancedCallControls] Video toggle clicked, current state:', isVideoEnabled);
    setButtonStates(prev => ({ ...prev, videoPressed: true }));
    setTimeout(() => setButtonStates(prev => ({ ...prev, videoPressed: false })), 150);
    onToggleVideo();
  };

  const handleSpeakerToggle = () => {
    console.log('[EnhancedCallControls] Speaker toggle clicked, current state:', isSpeakerEnabled);
    setButtonStates(prev => ({ ...prev, speakerPressed: true }));
    setTimeout(() => setButtonStates(prev => ({ ...prev, speakerPressed: false })), 150);
    onToggleSpeaker();
  };

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 bg-gradient-to-r from-black/80 via-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl px-6 sm:px-8 py-4 sm:py-5 max-w-fit mx-auto shadow-2xl border border-primary/10 animate-fade-in">
      {/* Audio Control */}
      <Button
        variant={isAudioEnabled ? "secondary" : "destructive"}
        size="lg"
        onClick={handleAudioToggle}
        className={`rounded-full w-16 h-16 p-0 transition-all duration-300 hover:scale-105 active:scale-95 ${
          buttonStates.audioPressed ? 'scale-95' : ''
        } ${
          isAudioEnabled 
            ? 'bg-card/40 hover:bg-card/60 border-2 border-call-excellent/50 shadow-xl shadow-call-excellent/20 backdrop-blur-sm' 
            : 'bg-destructive/80 hover:bg-destructive border-2 border-destructive shadow-xl shadow-destructive/30'
        } ${!canUseControls ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!canUseControls}
        title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
      >
        {isAudioEnabled ? (
          <Mic className="w-7 h-7 text-call-excellent transition-all duration-200" />
        ) : (
          <MicOff className="w-7 h-7 text-destructive-foreground transition-all duration-200" />
        )}
      </Button>

      {/* Video Control (for video calls) */}
      {callType === 'video' && (
        <Button
          variant={isVideoEnabled ? "secondary" : "destructive"}
          size="lg"
          onClick={handleVideoToggle}
          className={`rounded-full w-16 h-16 p-0 transition-all duration-300 hover:scale-105 active:scale-95 ${
            buttonStates.videoPressed ? 'scale-95' : ''
          } ${
            isVideoEnabled 
              ? 'bg-card/40 hover:bg-card/60 border-2 border-call-good/50 shadow-xl shadow-call-good/20 backdrop-blur-sm' 
              : 'bg-destructive/80 hover:bg-destructive border-2 border-destructive shadow-xl shadow-destructive/30'
          } ${!canUseControls ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!canUseControls}
          title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {isVideoEnabled ? (
            <Video className="w-7 h-7 text-call-good transition-all duration-200" />
          ) : (
            <VideoOff className="w-7 h-7 text-destructive-foreground transition-all duration-200" />
          )}
        </Button>
      )}

      {/* Answer/End Call Buttons */}
      {isIncoming && status === 'idle' ? (
        <div className="flex gap-6 animate-scale-in">
          <Button
            variant="default"
            size="lg"
            onClick={onAnswer}
            className="rounded-full w-20 h-20 p-0 bg-gradient-to-r from-success to-call-excellent hover:from-success/90 hover:to-call-excellent/90 transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse shadow-2xl shadow-success/40 border-2 border-success/60"
            title="Answer call"
          >
            {callType === 'video' ? (
              <Video className="w-8 h-8 text-success-foreground transition-transform duration-200" />
            ) : (
              <Volume2 className="w-8 h-8 text-success-foreground transition-transform duration-200" />
            )}
          </Button>
          <Button
            variant="destructive"
            size="lg"
            onClick={onEndCall}
            className="rounded-full w-20 h-20 p-0 bg-gradient-to-r from-destructive to-call-poor hover:from-destructive/90 hover:to-call-poor/90 transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl shadow-destructive/40 border-2 border-destructive/60"
            title="Decline call"
          >
            <PhoneOff className="w-8 h-8 text-destructive-foreground transition-transform duration-200" />
          </Button>
        </div>
      ) : (
        <Button
          variant="destructive"
          size="lg"
          onClick={onEndCall}
          className="rounded-full w-16 h-16 p-0 bg-gradient-to-r from-destructive to-call-poor hover:from-destructive/90 hover:to-call-poor/90 transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl shadow-destructive/40 border-2 border-destructive/60"
          title="End call"
        >
          <PhoneOff className="w-7 h-7 text-destructive-foreground transition-transform duration-200" />
        </Button>
      )}

      {/* Speaker Control */}
      <Button
        variant={isSpeakerEnabled ? "secondary" : "outline"}
        size="lg"
        onClick={handleSpeakerToggle}
        className={`rounded-full w-16 h-16 p-0 transition-all duration-300 hover:scale-105 active:scale-95 ${
          buttonStates.speakerPressed ? 'scale-95' : ''
        } ${
          isSpeakerEnabled 
            ? 'bg-card/40 hover:bg-card/60 border-2 border-warning/50 shadow-xl shadow-warning/20 backdrop-blur-sm' 
            : 'bg-muted/40 hover:bg-muted/60 border-2 border-muted shadow-xl backdrop-blur-sm'
        } ${!canUseControls ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!canUseControls}
        title={isSpeakerEnabled ? "Turn off speaker" : "Turn on speaker"}
      >
        {isSpeakerEnabled ? (
          <Volume2 className="w-7 h-7 text-warning transition-transform duration-200" />
        ) : (
          <VolumeX className="w-7 h-7 text-muted-foreground transition-transform duration-200" />
        )}
      </Button>

      {/* More Options */}
      <DropdownMenu open={showMoreOptions} onOpenChange={setShowMoreOptions}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-16 h-16 p-0 transition-all duration-300 hover:scale-105 active:scale-95 bg-card/30 hover:bg-card/50 border-2 border-primary/20 shadow-xl backdrop-blur-sm"
            disabled={!canUseControls}
            title="More options"
          >
            <MoreVertical className="w-7 h-7 text-foreground transition-transform duration-200" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="center" 
          side="top" 
          className="mb-4 bg-popover/95 border-border backdrop-blur-xl animate-fade-in shadow-2xl z-50"
        >
          {callType === 'video' && onScreenShare && (
            <DropdownMenuItem 
              onClick={onScreenShare} 
              className="text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
            >
              <Monitor className="w-4 h-4 mr-2 text-call-good" />
              {isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150">
            <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
            Call Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem 
            className="text-destructive hover:bg-destructive/20 focus:text-destructive transition-colors duration-150"
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