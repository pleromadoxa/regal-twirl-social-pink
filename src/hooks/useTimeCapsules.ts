import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TimeCapsule {
  id: string;
  creator_id: string;
  title: string;
  content: string;
  media_urls: string[];
  reveal_date: string;
  recipients: string[];
  is_revealed: boolean;
  visibility: 'private' | 'recipients' | 'public';
  created_at: string;
  revealed_at: string | null;
}

export const useTimeCapsules = () => {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCapsules = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('time_capsules')
        .select('*')
        .eq('creator_id', user.id)
        .order('reveal_date', { ascending: true });

      if (error) throw error;
      setCapsules((data || []).map(c => ({
        ...c,
        media_urls: Array.isArray(c.media_urls) ? c.media_urls as string[] : [],
        recipients: Array.isArray(c.recipients) ? c.recipients as string[] : []
      })) as TimeCapsule[]);
    } catch (error) {
      console.error('Error fetching time capsules:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCapsules();
    }
  }, [user]);

  const createCapsule = async (capsule: Omit<TimeCapsule, 'id' | 'creator_id' | 'is_revealed' | 'created_at' | 'revealed_at'>) => {
    if (!user) return null;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('time_capsules')
        .insert({ ...capsule, creator_id: user.id })
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Time capsule created", description: "It will be revealed on the scheduled date" });
      await fetchCapsules();
      return data;
    } catch (error: any) {
      console.error('Error creating time capsule:', error);
      toast({ title: "Failed to create time capsule", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCapsule = async (capsuleId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('time_capsules')
        .delete()
        .eq('id', capsuleId)
        .eq('creator_id', user?.id);

      if (error) throw error;

      toast({ title: "Time capsule deleted" });
      await fetchCapsules();
      return true;
    } catch (error: any) {
      console.error('Error deleting time capsule:', error);
      toast({ title: "Failed to delete time capsule", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const revealCapsule = async (capsuleId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('time_capsules')
        .update({ 
          is_revealed: true, 
          revealed_at: new Date().toISOString() 
        })
        .eq('id', capsuleId)
        .eq('creator_id', user?.id);

      if (error) throw error;

      toast({ title: "Time capsule revealed!" });
      await fetchCapsules();
      return true;
    } catch (error: any) {
      console.error('Error revealing time capsule:', error);
      toast({ title: "Failed to reveal time capsule", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    capsules,
    loading,
    createCapsule,
    deleteCapsule,
    revealCapsule,
    refetch: fetchCapsules
  };
};