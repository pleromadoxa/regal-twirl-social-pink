
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, X, Eye, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStories, Story } from '@/hooks/useStories';
import { useAuth } from '@/contexts/AuthContext';

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
  const { viewStory, deleteStory } = useStories();
  const { user } = useAuth();

  const currentUserStories = userStories[currentUserIndex];
  const currentStory = currentUserStories?.stories[currentStoryIndex];

  useEffect(() => {
    if (!currentStory) return;

    // Mark story as viewed
    if (currentStory.user_id !== user?.id && !currentStory.user_viewed) {
      viewStory(currentStory.id);
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
                <AvatarImage src={currentUserStories.profile.avatar_url} />
                <AvatarFallback>
                  {currentUserStories.profile.display_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{currentUserStories.profile.display_name}</p>
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
              <video 
                src={currentStory.content_url}
                className="w-full h-full object-contain"
                autoPlay
                muted
                onEnded={nextStory}
              />
            )}

            {/* Navigation areas */}
            <div className="absolute inset-0 flex">
              <div className="flex-1" onClick={prevStory} />
              <div className="flex-1" onClick={nextStory} />
            </div>
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
