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

  // Separate and group stories by personal vs business pages
  const userStoriesData = stories?.reduce((acc: any[], story: any) => {
    console.log('Processing story:', story); // Debug log
    
    // If story is from a business page, group by business page
    if (story.business_page_id && story.business_page) {
      const existingPage = acc.find(u => u.userId === `business_${story.business_page_id}`);
      if (existingPage) {
        existingPage.stories.push(story);
        if (!story.user_viewed) {
          existingPage.hasUnviewed = true;
        }
      } else {
        acc.push({
          userId: `business_${story.business_page_id}`,
          isBusinessPage: true,
          businessPageId: story.business_page_id,
          stories: [story],
          profile: {
            username: story.business_page.page_name,
            display_name: story.business_page.page_name,
            avatar_url: story.business_page.avatar_url || '/placeholder.svg',
          },
          hasUnviewed: !story.user_viewed,
        });
      }
    } else {
      // Personal stories grouped by user
      const existingUser = acc.find(u => u.userId === story.user_id && !u.isBusinessPage);
      if (existingUser) {
        existingUser.stories.push(story);
        if (!story.user_viewed) {
          existingUser.hasUnviewed = true;
        }
      } else {
        acc.push({
          userId: story.user_id,
          isBusinessPage: false,
          stories: [story],
          profile: {
            username: story.profiles?.username || 'user',
            display_name: story.profiles?.display_name || 'User',
            avatar_url: story.profiles?.avatar_url || '/placeholder.svg',
          },
          hasUnviewed: !story.user_viewed,
        });
      }
    }
    return acc;
  }, []) || [];

  console.log('Grouped stories data:', userStoriesData); // Debug log


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
          const hasLiveStory = userData.stories.some((s: any) => s.is_live);
          
          return (
            <div key={userData.userId} className="flex-shrink-0 text-center cursor-pointer relative">
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
                
                {userData.stories.length > 1 && !hasLiveStory && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {userData.stories.length}
                  </Badge>
                )}
                
                {hasLiveStory && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 text-xs font-bold shadow-lg">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </div>
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