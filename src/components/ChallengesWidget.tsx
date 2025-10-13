import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Challenge {
  id: string;
  title: string;
  category: string;
  participants_count: number;
  end_date: string;
}

const ChallengesWidget = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingChallenges();
  }, []);

  const fetchTrendingChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('social_challenges')
        .select('id, title, category, participants_count, end_date')
        .eq('is_public', true)
        .order('participants_count', { ascending: false })
        .limit(3);

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'fitness': return '💪';
      case 'creativity': return '🎨';
      case 'learning': return '📚';
      case 'wellness': return '🧘';
      case 'social': return '👥';
      default: return '🎯';
    }
  };

  if (challenges.length === 0) return null;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Trending Challenges</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/challenges')}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="p-3 rounded-lg border border-border hover:border-primary cursor-pointer transition-all duration-fast hover:shadow-md"
            onClick={() => navigate('/challenges')}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{getCategoryIcon(challenge.category)}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm line-clamp-1">{challenge.title}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {challenge.category}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{challenge.participants_count}</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Active</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ChallengesWidget;