import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SocialChallenge {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  category: 'fitness' | 'creativity' | 'learning' | 'wellness' | 'social' | 'other';
  goal_type: 'count' | 'duration' | 'completion';
  goal_value: number | null;
  duration_days: number;
  start_date: string;
  end_date: string;
  participants_count: number;
  cover_image_url: string | null;
  is_public: boolean;
  created_at: string;
  creator_profile?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  progress: number;
  status: 'active' | 'completed' | 'abandoned';
  joined_at: string;
  completed_at: string | null;
}

export const useSocialChallenges = () => {
  const [challenges, setChallenges] = useState<SocialChallenge[]>([]);
  const [myParticipations, setMyParticipations] = useState<ChallengeParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('social_challenges')
        .select(`
          *,
          creator_profile:profiles!social_challenges_creator_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setChallenges((data || []) as SocialChallenge[]);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchMyParticipations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setMyParticipations((data || []) as ChallengeParticipant[]);
    } catch (error) {
      console.error('Error fetching participations:', error);
    }
  };

  useEffect(() => {
    fetchChallenges();
    if (user) {
      fetchMyParticipations();
    }
  }, [user]);

  const createChallenge = async (challenge: Omit<SocialChallenge, 'id' | 'creator_id' | 'participants_count' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_challenges')
        .insert({ ...challenge, creator_id: user.id })
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Challenge created successfully" });
      await fetchChallenges();
      return data;
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      toast({ title: "Failed to create challenge", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          progress: 0,
          status: 'active'
        });

      if (error) throw error;

      toast({ title: "Joined challenge successfully" });
      await Promise.all([fetchChallenges(), fetchMyParticipations()]);
      return true;
    } catch (error: any) {
      console.error('Error joining challenge:', error);
      toast({ title: "Failed to join challenge", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (participantId: string, progress: number) => {
    try {
      setLoading(true);
      const updates: any = { progress };
      
      // Check if challenge is complete
      const participant = myParticipations.find(p => p.id === participantId);
      if (participant) {
        const challenge = challenges.find(c => c.id === participant.challenge_id);
        if (challenge && challenge.goal_value && progress >= challenge.goal_value) {
          updates.status = 'completed';
          updates.completed_at = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from('challenge_participants')
        .update(updates)
        .eq('id', participantId);

      if (error) throw error;

      toast({ title: "Progress updated" });
      await fetchMyParticipations();
      return true;
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast({ title: "Failed to update progress", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const leaveChallenge = async (participantId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('challenge_participants')
        .update({ status: 'abandoned' })
        .eq('id', participantId);

      if (error) throw error;

      toast({ title: "Left challenge" });
      await fetchMyParticipations();
      return true;
    } catch (error: any) {
      console.error('Error leaving challenge:', error);
      toast({ title: "Failed to leave challenge", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    challenges,
    myParticipations,
    loading,
    createChallenge,
    joinChallenge,
    updateProgress,
    leaveChallenge,
    refetch: () => {
      fetchChallenges();
      fetchMyParticipations();
    }
  };
};