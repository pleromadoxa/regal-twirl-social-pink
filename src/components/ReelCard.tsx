
import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import MaximizedReelViewer from './MaximizedReelViewer';

export interface Reel {
  id: string;
  video_url: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  duration?: number;
  created_at: string;
  user_liked?: boolean;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
  onLike: (reelId: string) => void;
  onView: (reelId: string) => void;
}

const ReelCard = ({ reel, isActive, onLike, onView }: ReelCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasViewed, setHasViewed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (videoRef.current) {
      if (isActive && !hasViewed) {
        // Record view when video becomes active
        onView(reel.id);
        setHasViewed(true);
      }
      
      if (isActive) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive, reel.id, onView, hasViewed]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = () => {
    if (user) {
      onLike(reel.id);
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
      <video
        ref={videoRef}
        src={reel.video_url}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlayPause}
      />
      
      {/* Maximize button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <MaximizedReelViewer videoUrl={reel.video_url} title={reel.title} />
      </div>

      {/* Play/Pause overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Button
          variant="ghost"
          size="lg"
          onClick={togglePlayPause}
          className={cn(
            "text-white bg-black/30 hover:bg-black/50 rounded-full transition-all",
            isPlaying ? "opacity-0" : "opacity-100"
          )}
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </Button>
      </div>

      {/* Mute/Unmute button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMute}
        className="absolute top-4 left-4 text-white bg-black/50 hover:bg-black/70 rounded-full"
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </Button>

      {/* User info and actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-end justify-between">
          {/* User info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Avatar className="w-8 h-8 border-2 border-white">
                <AvatarImage src={reel.profiles?.avatar_url} />
                <AvatarFallback className="bg-purple-500 text-white text-xs">
                  {reel.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold text-sm">
                  {reel.profiles?.display_name || reel.profiles?.username || 'Unknown User'}
                </p>
                <p className="text-white/80 text-xs">
                  @{reel.profiles?.username || 'unknown'}
                </p>
              </div>
            </div>
            
            {reel.description && (
              <p className="text-white text-sm mb-1 line-clamp-2">
                {reel.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-center space-y-3 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "text-white hover:bg-white/20 rounded-full p-2",
                reel.user_liked && "text-red-500"
              )}
            >
              <Heart 
                className={cn(
                  "w-6 h-6",
                  reel.user_liked && "fill-current"
                )} 
              />
            </Button>
            <span className="text-white text-xs font-semibold">
              {reel.likes_count}
            </span>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <span className="text-white text-xs font-semibold">
              {reel.comments_count}
            </span>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              <Share className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelCard;
