
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Play } from 'lucide-react';
import { useStories } from '@/hooks/useStories';
import { useAuth } from '@/contexts/AuthContext';
import { StoryUpload } from '@/components/StoryUpload';
import { StoryViewer } from '@/components/StoryViewer';

export const StoriesBar = () => {
  const { stories, loading } = useStories();
  const { user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  // Group stories by user AND business page separately
  // This creates separate story circles for personal stories and business page stories
  const groupedStories = stories.reduce((acc, story) => {
    // Create a unique key: if business page exists, use "business-{pageId}", otherwise use "user-{userId}"
    const groupKey = story.business_page_id 
      ? `business-${story.business_page_id}` 
      : `user-${story.user_id}`;
    
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(story);
    return acc;
  }, {} as Record<string, typeof stories>);

  const userStories = Object.entries(groupedStories).map(([groupKey, userStoryList]) => {
    const firstStory = userStoryList[0];
    const isBusinessPage = groupKey.startsWith('business-');
    
    return {
      userId: firstStory.user_id,
      businessPageId: firstStory.business_page_id,
      stories: userStoryList,
      profile: isBusinessPage && firstStory.business_page 
        ? {
            username: firstStory.business_page.page_name,
            display_name: firstStory.business_page.page_name,
            avatar_url: firstStory.business_page.avatar_url || ''
          }
        : firstStory.profiles,
      isBusinessPage,
      hasUnviewed: userStoryList.some(s => !s.user_viewed)
    };
  });

  if (loading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-4 p-4 overflow-x-auto border-b border-purple-200 dark:border-purple-800">
        {/* Add Story Button */}
        {user && (
          <div className="flex-shrink-0 text-center">
            <Button
              onClick={() => setShowUpload(true)}
              className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-0"
            >
              <Plus className="w-8 h-8 text-white" />
            </Button>
            <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">Add Story</p>
          </div>
        )}

        {/* User Stories */}
        {userStories.map((userStory, index) => (
          <div 
            key={`${userStory.userId}-${userStory.businessPageId || 'personal'}`}
            className="flex-shrink-0 text-center cursor-pointer"
            onClick={() => setSelectedStoryIndex(index)}
          >
            <div className={`w-16 h-16 rounded-xl p-0.5 ${
              userStory.hasUnviewed 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                : 'bg-slate-300 dark:bg-slate-600'
            }`}>
              <div className="w-full h-full bg-white dark:bg-slate-800 rounded-xl p-0.5">
                <Avatar className="w-full h-full rounded-xl">
                  <AvatarImage 
                    src={userStory.profile.avatar_url} 
                    className="object-cover rounded-xl"
                  />
                  <AvatarFallback className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {userStory.profile.display_name?.[0] || userStory.profile.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <p className="text-xs mt-1 text-slate-600 dark:text-slate-400 truncate w-16">
              {userStory.userId === user?.id && !userStory.isBusinessPage 
                ? 'Your Story' 
                : userStory.isBusinessPage && userStory.userId === user?.id
                ? userStory.profile.display_name
                : userStory.profile.username}
            </p>
            {userStory.stories[0].content_type === 'video' && (
              <Play className="w-3 h-3 absolute top-1 right-1 text-white" />
            )}
          </div>
        ))}

        {userStories.length === 0 && (
          <div className="flex-1 text-center py-8 text-slate-500 dark:text-slate-400">
            No stories yet. Be the first to share!
          </div>
        )}
      </div>

      {/* Story Upload Modal */}
      {showUpload && (
        <StoryUpload 
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Story Viewer */}
      {selectedStoryIndex !== null && (
        <StoryViewer 
          userStories={userStories}
          initialUserIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}
    </>
  );
};
