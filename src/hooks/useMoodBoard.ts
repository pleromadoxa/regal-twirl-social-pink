import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserMood {
  id: string;
  user_id: string;
  mood: string;
  activity: string | null;
  music_track: string | null;
  emoji: string;
  custom_message: string | null;
  color_theme: string;
  expires_at: string;
  created_at: string;
}

export const useMoodBoard = () => {
  const [myMood, setMyMoodState] = useState<UserMood | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMood = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_moods')
        .select('*')
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      setMyMoodState((data as any) || null);
    } catch (error: any) {
      console.error('Error fetching mood:', error);
    } finally {
      setLoading(false);
    }
  };

  const setMood = async (mood: Partial<UserMood>) => {
    if (!user) return;
    try {
      setLoading(true);
      // Delete existing mood first
      await supabase.from('user_moods').delete().eq('user_id', user.id);
      
      // Insert new mood
      const { data, error } = await supabase.from('user_moods').insert({ ...mood, user_id: user.id } as any).select().single();
      if (error) throw error;
      
      // Create a post on the timeline with the mood data
      const moodPost = {
        content: `🎨 Updated mood board`,
        user_id: user.id,
        metadata: {
          type: 'mood_board',
          mood: mood.mood,
          emoji: mood.emoji,
          activity: mood.activity,
          music_track: mood.music_track,
          color_theme: mood.color_theme,
          custom_message: mood.custom_message
        }
      };
      
      await supabase.from('posts').insert(moodPost);
      
      toast({ title: "Mood updated!" });
      await fetchMood();
      return data;
    } catch (error: any) {
      console.error('Error setting mood:', error);
      toast({ title: "Failed to set mood", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const clearMood = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { error } = await supabase.from('user_moods').delete().eq('user_id', user.id);
      if (error) throw error;
      toast({ title: "Mood cleared" });
      setMyMoodState(null);
    } catch (error: any) {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMood(); }, [user]);

  return { myMood, loading, setMood, clearMood, refetch: fetchMood };
};
