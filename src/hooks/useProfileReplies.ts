
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useProfileReplies = (userId?: string) => {
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserReplies = async () => {
    if (!userId) {
      console.log('useProfileReplies: No userId provided');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('useProfileReplies: Fetching replies for userId:', userId);
      
      const { data: repliesData, error } = await supabase
        .from('replies')
        .select(`
          *,
          posts (
            id,
            content,
            user_id,
            profiles (
              username,
              display_name,
              avatar_url,
              is_verified
            )
          ),
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
        console.error('useProfileReplies: Query error:', error);
        setReplies([]);
        return;
      }

      console.log('useProfileReplies: Raw data received:', repliesData);
      setReplies(repliesData || []);
    } catch (error) {
      console.error('Error fetching user replies:', error);
      setReplies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserReplies();
  }, [userId]);

  return {
    replies,
    loading,
    refetch: fetchUserReplies
  };
};
