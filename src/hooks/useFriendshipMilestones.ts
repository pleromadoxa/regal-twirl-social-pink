import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FriendshipMilestone {
  id: string;
  user_id: string;
  friend_id: string;
  milestone_type: 'anniversary' | 'birthday' | 'custom' | 'streak';
  title: string;
  description: string | null;
  date: string;
  is_recurring: boolean;
  reminder_enabled: boolean;
  created_at: string;
}

export const useFriendshipMilestones = () => {
  const [milestones, setMilestones] = useState<FriendshipMilestone[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMilestones = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from('friendship_milestones').select('*').order('date');
      if (error) throw error;
      setMilestones(data || []);
    } finally {
      setLoading(false);
    }
  };

  const createMilestone = async (milestone: Omit<FriendshipMilestone, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('friendship_milestones').insert({ ...milestone, user_id: user.id }).select().single();
      if (error) throw error;
      toast({ title: "Milestone created!" });
      await fetchMilestones();
      return data;
    } catch (error: any) {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      const { error } = await supabase.from('friendship_milestones').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Deleted" });
      await fetchMilestones();
    } catch (error: any) {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  useEffect(() => { fetchMilestones(); }, [user]);

  return { milestones, loading, createMilestone, deleteMilestone, refetch: fetchMilestones };
};
