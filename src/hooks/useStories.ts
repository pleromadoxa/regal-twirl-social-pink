
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionManager } from '@/utils/subscriptionManager';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Story {
  id: string;
  user_id: string;
  content_url: string;
  content_type: 'image' | 'video' | 'live_stream';
  caption?: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  file_size?: number;
  duration?: number;
  is_live?: boolean;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
  user_viewed?: boolean;
}

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchStories = async () => {
    try {
      setLoading(true);
      
      // First fetch stories
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (storiesError) throw storiesError;

      if (!storiesData || storiesData.length === 0) {
        setStories([]);
        return;
      }

      // Get unique user IDs from stories
      const userIds = [...new Set(storiesData.map(story => story.user_id))];

      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create a map of user_id to profile
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      // Check which stories the current user has viewed
      let storiesWithViews: Story[] = [];
      if (user && storiesData?.length) {
        const { data: viewsData } = await supabase
          .from('story_views')
          .select('story_id')
          .eq('viewer_id', user.id)
          .in('story_id', storiesData.map(s => s.id));

        const viewedStoryIds = new Set(viewsData?.map(v => v.story_id) || []);
        
        storiesWithViews = storiesData.map(story => {
          const profile = profilesMap.get(story.user_id);
          return {
            ...story,
            content_type: story.content_type as 'image' | 'video' | 'live_stream',
            user_viewed: viewedStoryIds.has(story.id),
            is_live: story.content_url?.endsWith('.m3u8') || story.content_type === 'live_stream',
            profiles: {
              username: profile?.username || 'Unknown',
              display_name: profile?.display_name || 'Unknown User',
              avatar_url: profile?.avatar_url || ''
            }
          };
        }) as Story[];
      } else if (storiesData) {
        storiesWithViews = storiesData.map(story => {
          const profile = profilesMap.get(story.user_id);
          return {
            ...story,
            content_type: story.content_type as 'image' | 'video' | 'live_stream',
            user_viewed: false,
            is_live: story.content_url?.endsWith('.m3u8') || story.content_type === 'live_stream',
            profiles: {
              username: profile?.username || 'Unknown',
              display_name: profile?.display_name || 'Unknown User',
              avatar_url: profile?.avatar_url || ''
            }
          };
        }) as Story[];
      }

      setStories(storiesWithViews);
    } catch (error) {
      console.error('Error fetching stories:', error);
      // Log the specific error for debugging
      console.error('Stories error details:', {
        error,
        message: error?.message,
        details: error?.details
      });
      
      toast({
        title: "Error", 
        description: "Failed to load stories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (file: File | string, caption?: string, isLiveStream = false, businessPageId?: string | null) => {
    if (!user) return;

    try {
      let contentUrl: string;
      let contentType: 'image' | 'video' | 'live_stream';
      let fileSize: number | undefined;

      if (typeof file === 'string') {
        // Live stream URL (.m3u8)
        contentUrl = file;
        contentType = 'live_stream';
        fileSize = undefined;
      } else {
        // Regular file upload
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('stories')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('stories')
          .getPublicUrl(fileName);

        contentUrl = publicUrl;
        contentType = file.type.startsWith('video/') ? 'video' : 'image';
        fileSize = file.size;
      }

      // Create story record
      const insertData: any = {
        user_id: user.id,
        content_url: contentUrl,
        content_type: contentType,
        caption,
        file_size: fileSize,
        duration: contentType === 'video' ? undefined : null
      };

      // Add business_page_id if provided
      if (businessPageId) {
        insertData.business_page_id = businessPageId;
      }

      const { error: insertError } = await supabase
        .from('stories')
        .insert(insertData);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: isLiveStream ? "Live story started successfully" : "Story uploaded successfully",
      });

      fetchStories();
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: "Failed to upload story",
        variant: "destructive",
      });
    }
  };

  const viewStory = async (storyId: string) => {
    if (!user) return;

    try {
      // Insert view record (will be ignored if already exists due to unique constraint)
      await supabase
        .from('story_views')
        .insert({
          story_id: storyId,
          viewer_id: user.id
        });

      // Update local state
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, user_viewed: true, view_count: story.view_count + 1 }
          : story
      ));
    } catch (error: any) {
      // Ignore duplicate key errors
      if (!error.message?.includes('duplicate key')) {
        console.error('Error viewing story:', error);
      }
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Story deleted successfully",
      });

      fetchStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: "Error",
        description: "Failed to delete story",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStories();

    // Set up real-time subscription using subscription manager
    const channelName = `stories-changes-${user?.id}`;
    
    const unsubscribe = subscriptionManager.subscribe(channelName, {
      postgres_changes: {
        config: {
          event: '*',
          schema: 'public',
          table: 'stories'
        },
        callback: () => {
          fetchStories();
        }
      }
    });

    return () => {
      // Proper cleanup
      unsubscribe();
    };
  }, [user?.id]); // Add user.id to dependencies

  return {
    stories,
    loading,
    createStory,
    viewStory,
    deleteStory,
    refetch: fetchStories
  };
};
