import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Music, Activity, Heart, Brain, Zap, Sun, Moon, Coffee, Headphones } from 'lucide-react';
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
        .gte('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) throw error;
      setMood(data);
    } catch (error) {
      console.error('Error fetching user mood:', error);
    }
  };

  const getMoodIcon = (moodLabel: string) => {
    const iconMap: Record<string, any> = {
      'Happy': Heart,
      'Cool': Sun,
      'Excited': Zap,
      'Peaceful': Moon,
      'Celebrating': Sparkles,
      'Motivated': Zap,
      'Zen': Brain,
      'Creative': Sparkles,
      'Focused': Brain,
      'Chill': Coffee,
      'Vibing': Headphones,
      'Working': Activity
    };
    return iconMap[moodLabel] || Sparkles;
  };

  if (!mood) return null;

  const MoodIcon = getMoodIcon(mood.mood);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Current Mood</span>
      </div>
      
      <div 
        className="relative p-4 rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg duration-300"
        style={{ 
          background: `linear-gradient(135deg, ${mood.color_theme}20, ${mood.color_theme}08)`,
          borderColor: `${mood.color_theme}40`
        }}
      >
        {/* Animated gradient orb */}
        <div 
          className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 animate-float"
          style={{ background: mood.color_theme }}
        />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <div 
                className="absolute inset-0 blur-lg opacity-40 animate-pulse"
                style={{ background: mood.color_theme }}
              />
              <MoodIcon className="relative w-5 h-5" style={{ color: mood.color_theme }} />
            </div>
            <span className="text-2xl drop-shadow-sm">{mood.emoji}</span>
            <span className="font-semibold text-base">{mood.mood}</span>
          </div>
          
          {mood.custom_message && (
            <p className="text-sm text-muted-foreground mb-3 bg-background/50 rounded-lg p-2 backdrop-blur-sm">
              {mood.custom_message}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2">
            {mood.activity && (
              <Badge variant="secondary" className="text-xs bg-background/60 backdrop-blur-sm">
                <Activity className="w-3 h-3 mr-1" />
                {mood.activity}
              </Badge>
            )}
            {mood.music_track && (
              <Badge variant="secondary" className="text-xs bg-background/60 backdrop-blur-sm">
                <Music className="w-3 h-3 mr-1" />
                {mood.music_track}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMoodDisplay;