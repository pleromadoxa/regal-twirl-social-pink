import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Music, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserMood {
  mood: string;
  emoji: string | null;
  activity: string | null;
  music_track: string | null;
  color_theme: string;
  custom_message: string | null;
}

interface UserMoodDisplayProps {
  userId: string;
}

const UserMoodDisplay = ({ userId }: UserMoodDisplayProps) => {
  const [mood, setMood] = useState<UserMood | null>(null);

  useEffect(() => {
    fetchUserMood();
  }, [userId]);

  const fetchUserMood = async () => {
    try {
      const { data, error } = await supabase
        .from('user_moods')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setMood(data);
    } catch (error) {
      console.error('Error fetching user mood:', error);
    }
  };

  if (!mood) return null;

  return (
    <div 
      className="p-3 rounded-lg animate-fade-in"
      style={{ 
        background: `linear-gradient(135deg, ${mood.color_theme}15, ${mood.color_theme}08)`,
        borderLeft: `3px solid ${mood.color_theme}`
      }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <Sparkles className="w-4 h-4" style={{ color: mood.color_theme }} />
        <span className="text-xl">{mood.emoji}</span>
        <span className="font-medium text-sm">{mood.mood}</span>
      </div>
      
      {mood.custom_message && (
        <p className="text-sm text-muted-foreground mb-2">{mood.custom_message}</p>
      )}
      
      <div className="flex flex-wrap gap-2">
        {mood.activity && (
          <Badge variant="secondary" className="text-xs">
            <Activity className="w-3 h-3 mr-1" />
            {mood.activity}
          </Badge>
        )}
        {mood.music_track && (
          <Badge variant="secondary" className="text-xs">
            <Music className="w-3 h-3 mr-1" />
            {mood.music_track}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default UserMoodDisplay;