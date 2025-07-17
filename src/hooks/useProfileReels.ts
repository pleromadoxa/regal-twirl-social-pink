
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
      
      // Query reels directly with profile data
      const { data: reelsData, error: reelsError } = await supabase
        .from('reels')
        .select(`
          *,
          profiles!user_id (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (reelsError) {
        console.error('useProfileReels: Reels query error:', reelsError);
        toast({
          title: "Error",
          description: "Failed to load reels",
          variant: "destructive"
        });
        setReels([]);
        return;
      }

      console.log('useProfileReels: Reels data received:', reelsData);
      setReels(reelsData || []);
    } catch (error) {
      console.error('Error fetching user reels:', error);
      toast({
        title: "Error",
        description: "Failed to load reels",
        variant: "destructive"
      });
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
