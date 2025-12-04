import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TimeCapsule {
  id: string;
  creator_id: string;
  title: string;
  content: string;
  media_urls: any;
  reveal_date: string;
  is_revealed: boolean;
  recipients: any;
  visibility: string;
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
      setLoading(true);
      const { data, error } = await supabase.from('time_capsules').select('*').order('reveal_date', { ascending: true });
      if (error) throw error;
      setCapsules((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching time capsules:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCapsule = async (capsule: Partial<TimeCapsule>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('time_capsules').insert({ ...capsule, creator_id: user.id } as any).select().maybeSingle();
      if (error) throw error;
      toast({ title: "Time capsule created!" });
      await fetchCapsules();
      return data;
    } catch (error: any) {
      toast({ title: "Failed to create", variant: "destructive" });
    }
  };

  const revealCapsule = async (capsuleId: string) => {
    try {
      const { error } = await supabase.from('time_capsules').update({ is_revealed: true, revealed_at: new Date().toISOString() } as any).eq('id', capsuleId);
      if (error) throw error;
      toast({ title: "Revealed!" });
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

  useEffect(() => { fetchCapsules(); }, [user]);

  return { capsules, loading, createCapsule, revealCapsule, deleteCapsule, refetch: fetchCapsules };
};
