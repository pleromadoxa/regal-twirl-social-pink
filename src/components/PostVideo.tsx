
import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostVideoProps {
  videoUrl: string;
  className?: string;
}

const PostVideo = ({ videoUrl, className = "" }: PostVideoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handlePlayPause = (video: HTMLVideoElement) => {
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = (video: HTMLVideoElement) => {
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className={`relative group ${className}`}>
      <video
        src={videoUrl}
        className="w-full h-auto max-h-96 object-cover rounded-lg"
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onClick={(e) => handlePlayPause(e.currentTarget)}
        preload="metadata"
      />
      
      {/* Video Controls Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 rounded-lg">
        <Button
          variant="ghost"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            const video = e.currentTarget.parentElement?.querySelector('video');
            if (video) handlePlayPause(video);
          }}
          className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            const video = e.currentTarget.parentElement?.querySelector('video');
            if (video) handleMuteToggle(video);
          }}
          className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default PostVideo;
