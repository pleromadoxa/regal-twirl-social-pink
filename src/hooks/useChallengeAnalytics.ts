import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChallengeAnalytics {
  id: string;
  challenge_id: string;
  date: string;
  views_count: number;
  joins_count: number;
  completions_count: number;
  abandons_count: number;
  average_progress: number;
  engagement_score: number;
}

export const useChallengeAnalytics = (challengeId?: string) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<ChallengeAnalytics[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const checkAdminStatus = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      setIsAdmin(!!data);
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (!challengeId) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      // For now, calculate simple analytics from participants
      const { data: participants } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('challenge_id', challengeId);

      if (participants) {
        const analytics: ChallengeAnalytics = {
          id: challengeId,
          challenge_id: challengeId,
          date: new Date().toISOString().split('T')[0],
          views_count: 0,
          joins_count: participants.length,
          completions_count: participants.filter(p => p.status === 'completed').length,
          abandons_count: participants.filter(p => p.status === 'abandoned').length,
          average_progress: participants.length > 0 
            ? participants.reduce((sum, p) => sum + p.progress, 0) / participants.length 
            : 0,
          engagement_score: participants.length * 1.5
        };
        setAnalytics([analytics]);
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, [challengeId]);

  const recordView = async (challengeId: string) => {
    // Simple view tracking - could be enhanced
    console.log('View recorded for challenge:', challengeId);
  };

  const getTotalMetrics = () => {
    if (!analytics.length) return null;
    
    return {
      totalViews: analytics.reduce((sum, a) => sum + a.views_count, 0),
      totalJoins: analytics.reduce((sum, a) => sum + a.joins_count, 0),
      totalCompletions: analytics.reduce((sum, a) => sum + a.completions_count, 0),
      totalAbandons: analytics.reduce((sum, a) => sum + a.abandons_count, 0),
      averageProgress: analytics.reduce((sum, a) => sum + a.average_progress, 0) / analytics.length,
      averageEngagement: analytics.reduce((sum, a) => sum + a.engagement_score, 0) / analytics.length,
      completionRate: analytics.reduce((sum, a) => sum + a.joins_count, 0) > 0 
        ? (analytics.reduce((sum, a) => sum + a.completions_count, 0) / analytics.reduce((sum, a) => sum + a.joins_count, 0)) * 100 
        : 0
    };
  };

  return {
    analytics,
    isAdmin,
    loading,
    recordView,
    getTotalMetrics
  };
};