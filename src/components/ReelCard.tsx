
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
  isActive?: boolean;
  onLike: (reelId: string) => void;
  onView: (reelId: string) => void;
  onComment?: (reel: Reel) => void;
}

const ReelCard = ({ reel, isActive = false, onLike, onView, onComment }: ReelCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasViewed, setHasViewed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (videoRef.current) {
      if (isActive && !hasViewed) {
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

  const handleComment = () => {
    if (onComment) {
      onComment(reel);
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-black rounded-xl overflow-hidden group shadow-2xl">
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
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
          {isPlaying ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12" />}
        </Button>
      </div>

      {/* Mute/Unmute button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMute}
        className="absolute top-4 left-4 text-white bg-black/50 hover:bg-black/70 rounded-full"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </Button>

      {/* User info and actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-end justify-between">
          {/* User info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-12 h-12 border-2 border-white">
                <AvatarImage src={reel.profiles?.avatar_url} />
                <AvatarFallback className="bg-purple-500 text-white">
                  {reel.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold text-lg">
                  {reel.profiles?.display_name || reel.profiles?.username || 'Unknown User'}
                </p>
                <p className="text-white/80 text-sm">
                  @{reel.profiles?.username || 'unknown'}
                </p>
              </div>
            </div>
            
            {reel.title && (
              <h3 className="text-white font-semibold text-lg mb-2">
                {reel.title}
              </h3>
            )}
            
            {reel.description && (
              <p className="text-white text-sm mb-2 line-clamp-2">
                {reel.description}
              </p>
            )}

            <div className="flex items-center space-x-4 text-white/80 text-sm">
              <span>{reel.views_count} views</span>
              <span>•</span>
              <span>{new Date(reel.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-center space-y-4 ml-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "text-white hover:bg-white/20 rounded-full p-3",
                reel.user_liked && "text-red-500"
              )}
            >
              <Heart 
                className={cn(
                  "w-7 h-7",
                  reel.user_liked && "fill-current"
                )} 
              />
            </Button>
            <span className="text-white text-sm font-semibold">
              {reel.likes_count}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              className="text-white hover:bg-white/20 rounded-full p-3"
            >
              <MessageCircle className="w-7 h-7" />
            </Button>
            <span className="text-white text-sm font-semibold">
              {reel.comments_count}
            </span>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full p-3"
            >
              <Share className="w-7 h-7" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelCard;
