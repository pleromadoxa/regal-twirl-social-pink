
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useProfileReels = (userId?: string) => {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserReels = async () => {
    if (!userId) {
      console.log('useProfileReels: No userId provided');
      setLoading(false);
      setReels([]);
      return;
    }
    
    try {
      setLoading(true);
      console.log('useProfileReels: Fetching reels for userId:', userId);
      
      const { data: reelsData, error } = await supabase
        .from('reels')
        .select(`
          *,
          profiles (
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useProfileReels: Query error:', error);
        setReels([]);
        return;
      }

      console.log('useProfileReels: Raw data received:', reelsData);
      setReels(reelsData || []);
    } catch (error) {
      console.error('Error fetching user reels:', error);
      setReels([]);
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
