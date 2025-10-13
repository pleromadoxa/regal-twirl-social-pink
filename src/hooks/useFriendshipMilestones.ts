import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FriendshipMilestone {
  id: string;
  user_id: string;
  friend_id: string;
  milestone_type: 'birthday' | 'anniversary' | 'achievement' | 'memory' | 'other';
  title: string;
  description?: string;
  date: string;
  is_recurring: boolean;
  reminder_enabled: boolean;
  created_at: string;
  profiles?: {
    id: string;
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

  useEffect(() => {
    if (user) {
      fetchMilestones();
    }
  }, [user]);

  const fetchMilestones = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('friendship_milestones')
        .select(`
          *,
          profiles!friend_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setMilestones((data || []) as FriendshipMilestone[]);
    } catch (error: any) {
      console.error('Error fetching milestones:', error);
      toast({ 
        title: "Failed to fetch milestones", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const createMilestone = async (milestone: Omit<FriendshipMilestone, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('friendship_milestones')
        .insert({
          user_id: user.id,
          ...milestone
        });

      if (error) throw error;

      toast({ title: "Milestone created successfully" });
      await fetchMilestones();
    } catch (error: any) {
      console.error('Error creating milestone:', error);
      toast({ 
        title: "Failed to create milestone", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMilestone = async (milestoneId: string, updates: Partial<FriendshipMilestone>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('friendship_milestones')
        .update(updates)
        .eq('id', milestoneId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({ title: "Milestone updated successfully" });
      await fetchMilestones();
    } catch (error: any) {
      console.error('Error updating milestone:', error);
      toast({ 
        title: "Failed to update milestone", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMilestone = async (milestoneId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('friendship_milestones')
        .delete()
        .eq('id', milestoneId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({ title: "Milestone deleted successfully" });
      await fetchMilestones();
    } catch (error: any) {
      console.error('Error deleting milestone:', error);
      toast({ 
        title: "Failed to delete milestone", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    milestones,
    loading,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    refetch: fetchMilestones
  };
};
