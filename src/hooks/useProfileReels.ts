
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
      
      // Query reels table directly with user_id filter
      const { data: reelsData, error: reelsError } = await supabase
        .from('reels')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
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

      // Process reels data
      const processedReels = reelsData.map(reel => ({
        ...reel,
        views_count: reel.views_count || 0,
        likes_count: reel.likes_count || 0,
        comments_count: reel.comments_count || 0,
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
