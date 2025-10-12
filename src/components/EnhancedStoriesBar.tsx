import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Heart, MessageCircle, Send, X, Camera, Music, Type, Palette } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStories } from '@/hooks/useStories';
import { StoryUpload } from './StoryUpload';
import { StoryViewer } from './StoryViewer';

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
  const [isCreating, setIsCreating] = useState(false);
  const [viewerData, setViewerData] = useState<{
    userStories: Array<{
      userId: string;
      stories: any[];
      profile: {
        username: string;
        display_name: string;
        avatar_url: string;
      };
      hasUnviewed: boolean;
    }>;
    initialUserIndex: number;
  } | null>(null);
  
  const { user } = useAuth();
  const { stories, loading } = useStories();

  // Filter stories to get unique users with their stories
  const userStoriesData = stories?.reduce((acc: any[], story: any) => {
    const existingUser = acc.find(u => u.userId === story.user_id);
    if (existingUser) {
      existingUser.stories.push(story);
    } else {
      acc.push({
        userId: story.user_id,
        stories: [story],
        profile: {
          username: story.profile?.username || 'user',
          display_name: story.profile?.display_name || 'User',
          avatar_url: story.profile?.avatar_url || '/placeholder.svg',
        },
        hasUnviewed: true,
      });
    }
    return acc;
  }, []) || [];


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
      {isCreating && <StoryUpload onClose={() => setIsCreating(false)} />}
      
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
        {userStoriesData.map((userData, index) => {
          return (
            <div key={userData.userId} className="flex-shrink-0 text-center cursor-pointer">
              <div
                className={`relative w-16 h-16 rounded-full p-0.5 ${
                  userData.hasUnviewed
                    ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400' 
                    : 'bg-muted'
                }`}
                onClick={() => {
                  setViewerData({
                    userStories: userStoriesData,
                    initialUserIndex: index,
                  });
                }}
              >
                <Avatar className="w-full h-full border-2 border-background">
                  <AvatarImage src={userData.profile.avatar_url} />
                  <AvatarFallback>
                    {userData.profile.display_name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {userData.stories.length > 1 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {userData.stories.length}
                  </Badge>
                )}
              </div>
              <p className="text-xs mt-1 text-muted-foreground truncate max-w-[64px]">
                {userData.profile.display_name}
              </p>
            </div>
          );
        })}
      </div>

      {/* Story Viewer */}
      {viewerData && (
        <StoryViewer
          userStories={viewerData.userStories}
          initialUserIndex={viewerData.initialUserIndex}
          onClose={() => setViewerData(null)}
        />
      )}
    </>
  );
};

export default EnhancedStoriesBar;