
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, X, Eye, Trash2, Radio } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStories, Story } from '@/hooks/useStories';
import { useAuth } from '@/contexts/AuthContext';
import Hls from 'hls.js';

interface StoryViewerProps {
  userStories: Array<{
    userId: string;
    stories: Story[];
    profile: {
      username: string;
      display_name: string;
      avatar_url: string;
    };
    hasUnviewed: boolean;
  }>;
  initialUserIndex: number;
  onClose: () => void;
}

export const StoryViewer = ({ userStories, initialUserIndex, onClose }: StoryViewerProps) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { viewStory, deleteStory } = useStories();
  const { user } = useAuth();

  const currentUserStories = userStories[currentUserIndex];
  const currentStory = currentUserStories?.stories[currentStoryIndex];

  // Handle HLS streams (.m3u8 files)
  useEffect(() => {
    if (!currentStory || !videoRef.current) return;
    
    // Check if the URL is an HLS stream (.m3u8)
    const isHlsStream = currentStory.content_url.endsWith('.m3u8');
    const isVideoContent = currentStory.content_type === 'video' || 
                          currentStory.content_type === 'live_stream' || 
                          currentStory.is_live;
    
    console.log('Story HLS check:', { 
      isHlsStream, 
      isVideoContent, 
      url: currentStory.content_url,
      contentType: currentStory.content_type 
    });
    
    if (isHlsStream && isVideoContent) {
      const video = videoRef.current;
      
      if (Hls.isSupported()) {
        console.log('HLS.js is supported, initializing...');
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          debug: true
        });
        
        hls.loadSource(currentStory.content_url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed, attempting playback');
          video.play().catch(err => {
            console.error('HLS playback error:', err);
          });
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', { event, data });
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.log('Fatal error, destroying HLS instance');
                hls.destroy();
                break;
            }
          }
        });
        
        return () => {
          console.log('Cleaning up HLS instance');
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        console.log('Using native HLS support (Safari)');
        video.src = currentStory.content_url;
        video.addEventListener('loadedmetadata', () => {
          console.log('Native HLS metadata loaded, attempting playback');
          video.play().catch(err => {
            console.error('Native HLS playback error:', err);
          });
        });
      } else {
        console.error('HLS is not supported in this browser');
      }
    }
  }, [currentStory]);

  useEffect(() => {
    if (!currentStory) return;

    // Mark story as viewed
    if (currentStory.user_id !== user?.id && !currentStory.user_viewed) {
      viewStory(currentStory.id);
    }

    // Don't auto-advance for live streams
    if (currentStory.is_live) {
      setProgress(100);
      return;
    }

    // Auto-advance progress
    const duration = currentStory.content_type === 'video' ? 
      (currentStory.duration || 10) * 1000 : 5000;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / 100));
        if (newProgress >= 100) {
          nextStory();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentUserIndex, currentStoryIndex]);

  const nextStory = () => {
    setProgress(0);
    if (currentStoryIndex < currentUserStories.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (currentUserIndex < userStories.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    setProgress(0);
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(userStories[currentUserIndex - 1].stories.length - 1);
    }
  };

  const handleDeleteStory = async () => {
    if (currentStory && currentStory.user_id === user?.id) {
      await deleteStory(currentStory.id);
      onClose();
    }
  };

  if (!currentStory) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-sm h-[80vh] p-0 bg-black">
        <div className="relative h-full flex flex-col">
          {/* Progress bars */}
          <div className="flex gap-1 p-2">
            {currentUserStories.stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width: index < currentStoryIndex ? '100%' : 
                           index === currentStoryIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={
                  currentStory.business_page_id && currentStory.business_page
                    ? currentStory.business_page.avatar_url 
                    : currentUserStories.profile.avatar_url
                } />
                <AvatarFallback>
                  {currentStory.business_page_id && currentStory.business_page
                    ? currentStory.business_page.page_name?.[0] || 'B'
                    : currentUserStories.profile.display_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {currentStory.business_page_id && currentStory.business_page
                    ? currentStory.business_page.page_name
                    : currentUserStories.profile.display_name}
                </p>
                <p className="text-sm text-white/70">
                  {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentStory.user_id === user?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteStory}
                  className="text-white hover:bg-white/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 relative">
            {currentStory.content_type === 'image' ? (
              <img 
                src={currentStory.content_url} 
                alt="Story"
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <video 
                  ref={videoRef}
                  src={!currentStory.content_url.endsWith('.m3u8') ? currentStory.content_url : undefined}
                  className="w-full h-full object-contain"
                  autoPlay
                  muted
                  playsInline
                  controls={currentStory.is_live || currentStory.content_url.endsWith('.m3u8')}
                  onEnded={nextStory}
                />
                {(currentStory.is_live || currentStory.content_type === 'live_stream') && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-md flex items-center gap-2 font-bold z-10">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </div>
                )}
              </>
            )}

            {/* Navigation areas */}
            {!currentStory.is_live && (
              <div className="absolute inset-0 flex">
                <div className="flex-1" onClick={prevStory} />
                <div className="flex-1" onClick={nextStory} />
              </div>
            )}
          </div>

          {/* Caption */}
          {currentStory.caption && (
            <div className="p-4 text-white">
              <p>{currentStory.caption}</p>
            </div>
          )}

          {/* Story stats */}
          {currentStory.user_id === user?.id && (
            <div className="flex items-center gap-2 p-4 text-white/70">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{currentStory.view_count} views</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
