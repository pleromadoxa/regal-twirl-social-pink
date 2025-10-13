import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FriendshipMilestone {
  id: string;
  user_id: string;
  friend_id: string;
  milestone_type: 'anniversary' | 'birthday' | 'custom' | 'streak' | 'achievement' | 'memory' | 'other';
  title: string;
  description: string | null;
  date: string;
  is_recurring: boolean;
  reminder_enabled: boolean;
  created_at: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
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
      const { data, error } = await supabase
        .from('friendship_milestones')
        .select(`
          *,
          profiles:friend_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .order('date');
      if (error) throw error;
      setMilestones((data as any) || []);
    } finally {
      setLoading(false);
    }
  };

  const createMilestone = async (milestone: Omit<FriendshipMilestone, 'id' | 'user_id' | 'created_at' | 'profiles'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('friendship_milestones').insert({ ...milestone, user_id: user.id } as any).select().single();
      if (error) throw error;
      toast({ title: "Milestone created!" });
      await fetchMilestones();
      return data;
    } catch (error: any) {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const updateMilestone = async (id: string, updates: Partial<FriendshipMilestone>) => {
    try {
      const { error } = await supabase.from('friendship_milestones').update(updates as any).eq('id', id);
      if (error) throw error;
      toast({ title: "Updated!" });
      await fetchMilestones();
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

  return { milestones, loading, createMilestone, updateMilestone, deleteMilestone, refetch: fetchMilestones };
};
