import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Heart, MessageCircle, Send, X, Camera, Music, Type, Palette } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStories } from '@/hooks/useStories';

interface Story {
  id: string;
  user_id: string;
  content_url: string;
  content_type: 'image' | 'video';
  caption?: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  reactions?: Array<{
    user_id: string;
    emoji: string;
    created_at: string;
  }>;
  profile?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

const EnhancedStoriesBar = () => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const [comment, setComment] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();
  const { stories, loading } = useStories();

  // Filter stories to get unique users
  const userStories = stories?.reduce((acc: Story[], story: Story) => {
    if (!acc.find(s => s.user_id === story.user_id)) {
      acc.push(story);
    }
    return acc;
  }, []) || [];

  const startStoryProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    setStoryProgress(0);
    const duration = selectedStory?.content_type === 'video' ? 15000 : 5000; // 15s for video, 5s for image
    const increment = 100 / (duration / 100);
    
    progressIntervalRef.current = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + increment;
      });
    }, 100);
  };

  const nextStory = () => {
    const currentUserStories = stories?.filter(s => s.user_id === selectedStory?.user_id) || [];
    if (currentStoryIndex < currentUserStories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setSelectedStory(currentUserStories[currentStoryIndex + 1]);
    } else {
      // Move to next user's stories
      const currentUserIndex = userStories.findIndex(s => s.user_id === selectedStory?.user_id);
      if (currentUserIndex < userStories.length - 1) {
        const nextUser = userStories[currentUserIndex + 1];
        const nextUserStories = stories?.filter(s => s.user_id === nextUser.user_id) || [];
        setSelectedStory(nextUserStories[0]);
        setCurrentStoryIndex(0);
      } else {
        closeStoryViewer();
      }
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      const currentUserStories = stories?.filter(s => s.user_id === selectedStory?.user_id) || [];
      setCurrentStoryIndex(prev => prev - 1);
      setSelectedStory(currentUserStories[currentStoryIndex - 1]);
    }
  };

  const closeStoryViewer = () => {
    setSelectedStory(null);
    setCurrentStoryIndex(0);
    setStoryProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const addReaction = (emoji: string) => {
    // In real app, this would update the database
    console.log('Adding reaction:', emoji);
    setShowReactions(false);
  };

  const sendComment = () => {
    if (!comment.trim()) return;
    // In real app, this would send to database
    console.log('Sending comment:', comment);
    setComment('');
  };

  useEffect(() => {
    if (selectedStory) {
      startStoryProgress();
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [selectedStory, currentStoryIndex]);

  if (loading) {
    return (
      <div className="flex space-x-4 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex space-x-4 p-4 overflow-x-auto scrollbar-hide border-b bg-card">
        {/* Add Story Button */}
        <div className="flex-shrink-0 text-center">
          <Button
            variant="outline"
            size="icon"
            className="w-16 h-16 rounded-full border-2 border-dashed border-primary/50 hover:border-primary"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-6 h-6" />
          </Button>
          <p className="text-xs mt-1 text-muted-foreground">Your Story</p>
        </div>

        {/* User Stories */}
        {userStories.map((story) => {
          const userStoriesCount = stories?.filter(s => s.user_id === story.user_id).length || 0;
          const hasUnviewedStories = true; // In real app, check if user has viewed all stories
          
          return (
            <div key={story.id} className="flex-shrink-0 text-center cursor-pointer">
              <div
                className={`relative w-16 h-16 rounded-full p-0.5 ${
                  hasUnviewedStories 
                    ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400' 
                    : 'bg-muted'
                }`}
                onClick={() => {
                  const userStories = stories?.filter(s => s.user_id === story.user_id) || [];
                  setSelectedStory(userStories[0]);
                  setCurrentStoryIndex(0);
                }}
              >
                <Avatar className="w-full h-full border-2 border-background">
                  <AvatarImage src={story.profile?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {(story.profile?.display_name || story.profile?.username || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {userStoriesCount > 1 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {userStoriesCount}
                  </Badge>
                )}
              </div>
              <p className="text-xs mt-1 text-muted-foreground truncate max-w-[64px]">
                {story.profile?.display_name || story.profile?.username || 'User'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Story Progress Bars */}
          <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
            {stories?.filter(s => s.user_id === selectedStory.user_id).map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ 
                    width: index < currentStoryIndex ? '100%' : 
                           index === currentStoryIndex ? `${storyProgress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* User Info */}
          <div className="absolute top-12 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={selectedStory.profile?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {(selectedStory.profile?.display_name || selectedStory.profile?.username || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold">
                  {selectedStory.profile?.display_name || selectedStory.profile?.username}
                </p>
                <p className="text-white/70 text-sm">
                  {new Date(selectedStory.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={closeStoryViewer}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Story Content */}
          <div className="relative w-full h-full flex items-center justify-center">
            {selectedStory.content_type === 'image' ? (
              <img
                src={selectedStory.content_url}
                alt="Story"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                src={selectedStory.content_url}
                autoPlay
                muted
                loop
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Story Caption */}
            {selectedStory.caption && (
              <div className="absolute bottom-20 left-4 right-4">
                <p className="text-white text-lg font-medium drop-shadow-lg">
                  {selectedStory.caption}
                </p>
              </div>
            )}
          </div>

          {/* Navigation Areas */}
          <div 
            className="absolute left-0 top-0 w-1/3 h-full z-10"
            onClick={prevStory}
          />
          <div 
            className="absolute right-0 top-0 w-1/3 h-full z-10"
            onClick={nextStory}
          />

          {/* Bottom Actions */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-3 z-10">
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Send message..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 bg-transparent border border-white/30 rounded-full px-4 py-2 text-white placeholder-white/70"
                onKeyPress={(e) => e.key === 'Enter' && sendComment()}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={sendComment}
                className="text-white hover:bg-white/20"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowReactions(!showReactions)}
              className="text-white hover:bg-white/20"
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>

          {/* Reaction Picker */}
          {showReactions && (
            <div className="absolute bottom-16 right-4 bg-black/80 backdrop-blur-sm rounded-full p-2 flex space-x-2">
              {['❤️', '😍', '😂', '😮', '😢', '👏'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addReaction(emoji)}
                  className="text-2xl hover:scale-125 transition-transform p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default EnhancedStoriesBar;