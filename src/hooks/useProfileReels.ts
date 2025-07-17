
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
      
      // First get reels
      const { data: reelsData, error: reelsError } = await supabase
        .from('reels')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (reelsError) {
        console.error('useProfileReels: Reels query error:', reelsError);
        setReels([]);
        return;
      }

      console.log('useProfileReels: Reels data received:', reelsData);

      if (!reelsData || reelsData.length === 0) {
        setReels([]);
        return;
      }

      // Then get the profile data for the user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('useProfileReels: Profile query error:', profileError);
        // Still show reels even if profile fails
      }

      const processedReels = reelsData.map(reel => ({
        ...reel,
        profiles: profileData || {
          id: userId,
          username: 'Unknown',
          display_name: 'Unknown User',
          avatar_url: null,
          is_verified: false
        }
      }));

      console.log('useProfileReels: Processed reels:', processedReels);
      setReels(processedReels);
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
