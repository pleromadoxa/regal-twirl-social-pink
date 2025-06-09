
import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { type Reel } from '@/services/reelsService';
import { formatDistanceToNow } from 'date-fns';

interface ReelCardProps {
  reel: Reel;
  onLike: (reelId: string) => void;
  onView: (reelId: string) => void;
  onComment: (reel: Reel) => void;
}

const ReelCard = ({ reel, onLike, onView, onComment }: ReelCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        if (!hasViewed) {
          onView(reel.id);
          setHasViewed(true);
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.title || 'Check out this reel',
          text: reel.description || '',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      video.currentTime = 0;
    };

    const handleEnded = () => {
      setIsPlaying(false);
      video.currentTime = 0;
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <Card className="relative w-full max-w-sm mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl">
      {/* Video Container */}
      <div className="relative aspect-[9/16] bg-black">
        <video
          ref={videoRef}
          src={reel.video_url}
          poster={reel.thumbnail_url}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
        />
        
        {/* Play/Pause Overlay */}
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={handlePlayPause}
        >
          {!isPlaying && (
            <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          )}
        </div>

        {/* User Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-8 h-8 border-2 border-white">
                  <AvatarImage src={reel.profiles.avatar_url} />
                  <AvatarFallback className="bg-purple-500 text-white text-sm">
                    {reel.profiles.display_name?.[0] || reel.profiles.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {reel.profiles.display_name || reel.profiles.username}
                  </p>
                  <p className="text-white/70 text-xs">
                    {formatDistanceToNow(new Date(reel.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              
              {reel.title && (
                <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                  {reel.title}
                </h3>
              )}
              
              {reel.description && (
                <p className="text-white/90 text-sm line-clamp-3">
                  {reel.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(reel.id);
                }}
                className="rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 p-3"
              >
                <Heart 
                  className={`w-6 h-6 ${reel.user_liked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                />
              </Button>
              
              <div className="text-center">
                <p className="text-white text-xs font-medium">
                  {reel.likes_count}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onComment(reel);
                }}
                className="rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 p-3"
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </Button>
              
              <div className="text-center">
                <p className="text-white text-xs font-medium">
                  {reel.comments_count}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 p-3"
              >
                <Share className="w-6 h-6 text-white" />
              </Button>

              <div className="text-center">
                <p className="text-white text-xs font-medium">
                  {reel.views_count}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReelCard;
