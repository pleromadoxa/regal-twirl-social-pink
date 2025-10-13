import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TimeCapsule {
  id: string;
  user_id: string;
  title: string;
  content: string;
  media_urls: string[];
  unlock_date: string;
  is_unlocked: boolean;
  recipients: string[];
  is_public: boolean;
  category: string;
  created_at: string;
  unlocked_at: string | null;
}

export const useTimeCapsules = () => {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCapsules = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from('time_capsules').select('*').order('unlock_date', { ascending: true });
      if (error) throw error;
      setCapsules(data || []);
    } catch (error: any) {
      console.error('Error fetching time capsules:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCapsule = async (capsule: Omit<TimeCapsule, 'id' | 'user_id' | 'created_at' | 'is_unlocked' | 'unlocked_at'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('time_capsules').insert({ ...capsule, user_id: user.id }).select().single();
      if (error) throw error;
      toast({ title: "Time capsule created!" });
      await fetchCapsules();
      return data;
    } catch (error: any) {
      toast({ title: "Failed to create", variant: "destructive" });
    }
  };

  const unlockCapsule = async (capsuleId: string) => {
    try {
      const { error } = await supabase.from('time_capsules').update({ is_unlocked: true, unlocked_at: new Date().toISOString() }).eq('id', capsuleId);
      if (error) throw error;
      toast({ title: "Unlocked!" });
      await fetchCapsules();
    } catch (error: any) {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const deleteCapsule = async (capsuleId: string) => {
    try {
      const { error } = await supabase.from('time_capsules').delete().eq('id', capsuleId);
      if (error) throw error;
      toast({ title: "Deleted" });
      await fetchCapsules();
    } catch (error: any) {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchCapsules();
  }, [user]);

  return { capsules, loading, createCapsule, unlockCapsule, deleteCapsule, refetch: fetchCapsules };
};
