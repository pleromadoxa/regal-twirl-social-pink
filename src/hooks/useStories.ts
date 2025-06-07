
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Story {
  id: string;
  user_id: string;
  content_url: string;
  content_type: 'image' | 'video';
  caption?: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  file_size?: number;
  duration?: number;
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
      
      // Fetch stories with user profiles
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles!stories_user_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which stories the current user has viewed
      let storiesWithViews = storiesData || [];
      if (user && storiesData?.length) {
        const { data: viewsData } = await supabase
          .from('story_views')
          .select('story_id')
          .eq('viewer_id', user.id)
          .in('story_id', storiesData.map(s => s.id));

        const viewedStoryIds = new Set(viewsData?.map(v => v.story_id) || []);
        
        storiesWithViews = storiesData.map(story => ({
          ...story,
          user_viewed: viewedStoryIds.has(story.id)
        }));
      }

      setStories(storiesWithViews);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (file: File, caption?: string) => {
    if (!user) return;

    try {
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

      // Create story record
      const { error: insertError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          content_url: publicUrl,
          content_type: file.type.startsWith('video/') ? 'video' : 'image',
          caption,
          file_size: file.size,
          duration: file.type.startsWith('video/') ? undefined : null
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Story uploaded successfully",
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
    } catch (error) {
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

    // Set up real-time subscription
    const channel = supabase
      .channel('stories-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'stories'
      }, () => {
        fetchStories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    stories,
    loading,
    createStory,
    viewStory,
    deleteStory,
    refetch: fetchStories
  };
};
