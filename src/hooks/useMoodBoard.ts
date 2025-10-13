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
  color_theme: string;
  emoji: string | null;
  custom_message: string | null;
  expires_at: string;
  created_at: string;
}

export const useMoodBoard = () => {
  const [myMood, setMyMood] = useState<UserMood | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMyMood = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_moods')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setMyMood(data);
    } catch (error) {
      console.error('Error fetching mood:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyMood();
    }
  }, [user]);

  const setMood = async (moodData: Omit<UserMood, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_moods')
        .upsert({ 
          ...moodData, 
          user_id: user.id 
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      setMyMood(data);
      toast({ title: "Mood updated successfully" });
      return true;
    } catch (error: any) {
      console.error('Error setting mood:', error);
      toast({ title: "Failed to update mood", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearMood = async () => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_moods')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setMyMood(null);
      toast({ title: "Mood cleared" });
      return true;
    } catch (error: any) {
      console.error('Error clearing mood:', error);
      toast({ title: "Failed to clear mood", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUserMood = async (userId: string): Promise<UserMood | null> => {
    try {
      const { data, error } = await supabase
        .from('user_moods')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user mood:', error);
      return null;
    }
  };

  return {
    myMood,
    loading,
    setMood,
    clearMood,
    getUserMood,
    refetch: fetchMyMood
  };
};