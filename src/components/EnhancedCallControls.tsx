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
    <div className="flex items-center justify-center gap-3 sm:gap-4 bg-gradient-to-r from-black/60 to-gray-900/60 backdrop-blur-lg rounded-2xl px-6 sm:px-8 py-4 sm:py-5 max-w-fit mx-auto shadow-2xl border border-white/10 animate-fade-in">
      {/* Audio Control */}
      <Button
        variant={isAudioEnabled ? "secondary" : "destructive"}
        size="lg"
        onClick={handleAudioToggle}
        className={`rounded-full w-16 h-16 p-0 transition-all duration-300 hover:scale-105 active:scale-95 ${
          buttonStates.audioPressed ? 'scale-95' : ''
        } ${
          isAudioEnabled 
            ? 'bg-white/20 hover:bg-white/30 border-2 border-green-400/50 shadow-lg shadow-green-400/25' 
            : 'bg-red-500/80 hover:bg-red-500 border-2 border-red-500 shadow-lg shadow-red-500/50'
        } ${!canUseControls ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!canUseControls}
        title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
      >
        {isAudioEnabled ? (
          <Mic className="w-7 h-7 text-green-400 transition-all duration-200" />
        ) : (
          <MicOff className="w-7 h-7 text-white transition-all duration-200" />
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
              ? 'bg-white/20 hover:bg-white/30 border-2 border-blue-400/50 shadow-lg shadow-blue-400/25' 
              : 'bg-red-500/80 hover:bg-red-500 border-2 border-red-500 shadow-lg shadow-red-500/50'
          } ${!canUseControls ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!canUseControls}
          title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {isVideoEnabled ? (
            <Video className="w-7 h-7 text-blue-400 transition-all duration-200" />
          ) : (
            <VideoOff className="w-7 h-7 text-white transition-all duration-200" />
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
            className="rounded-full w-20 h-20 p-0 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse shadow-2xl shadow-green-500/50 border-2 border-green-400/50"
            title="Answer call"
          >
            {callType === 'video' ? (
              <Video className="w-8 h-8 text-white transition-transform duration-200" />
            ) : (
              <Volume2 className="w-8 h-8 text-white transition-transform duration-200" />
            )}
          </Button>
          <Button
            variant="destructive"
            size="lg"
            onClick={onEndCall}
            className="rounded-full w-20 h-20 p-0 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl shadow-red-500/50 border-2 border-red-400/50"
            title="Decline call"
          >
            <PhoneOff className="w-8 h-8 text-white transition-transform duration-200" />
          </Button>
        </div>
      ) : (
        <Button
          variant="destructive"
          size="lg"
          onClick={onEndCall}
          className="rounded-full w-16 h-16 p-0 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl shadow-red-500/50 border-2 border-red-400/50"
          title="End call"
        >
          <PhoneOff className="w-7 h-7 text-white transition-transform duration-200" />
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
            ? 'bg-white/20 hover:bg-white/30 border-2 border-orange-400/50 shadow-lg shadow-orange-400/25' 
            : 'bg-gray-600/60 hover:bg-gray-500/60 border-2 border-gray-500/50 shadow-lg'
        } ${!canUseControls ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!canUseControls}
        title={isSpeakerEnabled ? "Turn off speaker" : "Turn on speaker"}
      >
        {isSpeakerEnabled ? (
          <Volume2 className="w-7 h-7 text-orange-400 transition-transform duration-200" />
        ) : (
          <VolumeX className="w-7 h-7 text-gray-300 transition-transform duration-200" />
        )}
      </Button>

      {/* More Options */}
      <DropdownMenu open={showMoreOptions} onOpenChange={setShowMoreOptions}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-16 h-16 p-0 transition-all duration-300 hover:scale-105 active:scale-95 bg-white/10 hover:bg-white/20 border-2 border-white/20 shadow-lg"
            disabled={!canUseControls}
            title="More options"
          >
            <MoreVertical className="w-7 h-7 text-white transition-transform duration-200" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="center" 
          side="top" 
          className="mb-4 bg-black/90 border-white/20 backdrop-blur-md animate-fade-in shadow-2xl"
        >
          {callType === 'video' && onScreenShare && (
            <DropdownMenuItem 
              onClick={onScreenShare} 
              className="text-white hover:bg-white/10 transition-colors duration-150"
            >
              <Monitor className="w-4 h-4 mr-2 text-blue-400" />
              {isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="text-white hover:bg-white/10 transition-colors duration-150">
            <Settings className="w-4 h-4 mr-2 text-gray-400" />
            Call Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/20" />
          <DropdownMenuItem 
            className="text-red-400 hover:bg-red-500/20 focus:text-red-400 transition-colors duration-150"
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