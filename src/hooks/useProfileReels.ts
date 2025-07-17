import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useProfileReels = (userId?: string) => {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserReels = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data: reelsData, error } = await supabase
        .from('reels')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReels(reelsData || []);
    } catch (error) {
      console.error('Error fetching user reels:', error);
      toast({
        title: "Error",
        description: "Failed to load reels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserReels();
  }, [userId]);

  return {
    reels,
    loading,
    refetch: fetchUserReels
  };
};