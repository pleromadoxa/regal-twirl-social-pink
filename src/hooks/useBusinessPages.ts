
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useBusinessPages = () => {
  const { user } = useAuth();
  const [myPages, setMyPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    if (!user) {
      setMyPages([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('business_pages')
        .select('*')
        .eq('owner_id', user.id);

      if (error) {
        console.error('Error fetching business pages:', error);
        setMyPages([]);
      } else {
        setMyPages(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setMyPages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [user]);

  const refetch = () => {
    setLoading(true);
    fetchPages();
  };

  return {
    myPages,
    loading,
    refetch
  };
};
