import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, Music, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserMoodWithProfile {
  id: string;
  user_id: string;
  mood: string;
  emoji: string | null;
  activity: string | null;
  music_track: string | null;
  color_theme: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

const MoodBoardWidget = () => {
  const [recentMoods, setRecentMoods] = useState<UserMoodWithProfile[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchRecentMoods();
  }, [user]);

  const fetchRecentMoods = async () => {
    try {
      const { data, error } = await supabase
        .from('user_moods')
        .select(`
          *,
          profiles!user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentMoods(data as any || []);
    } catch (error) {
      console.error('Error fetching moods:', error);
    }
  };

  if (recentMoods.length === 0) return null;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Current Vibes</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/mood')}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentMoods.map((mood) => (
          <div 
            key={mood.id}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-all duration-fast"
            style={{ 
              background: `linear-gradient(90deg, ${mood.color_theme}15, transparent)`,
              borderLeft: `3px solid ${mood.color_theme}`
            }}
            onClick={() => navigate(`/profile/${mood.user_id}`)}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={mood.profiles.avatar_url} />
              <AvatarFallback>
                {mood.profiles.display_name?.[0] || mood.profiles.username?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{mood.emoji}</span>
                <p className="font-medium text-sm truncate">
                  {mood.profiles.display_name || mood.profiles.username}
                </p>
              </div>
              <p className="text-xs text-muted-foreground truncate">{mood.mood}</p>
              {mood.activity && (
                <div className="flex items-center space-x-1 mt-1">
                  <Activity className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">{mood.activity}</span>
                </div>
              )}
              {mood.music_track && (
                <div className="flex items-center space-x-1 mt-1">
                  <Music className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">{mood.music_track}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MoodBoardWidget;