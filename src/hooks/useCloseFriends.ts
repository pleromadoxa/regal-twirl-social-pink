import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CloseFriend {
  id: string;
  friend_id: string;
  added_at: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const useCloseFriends = () => {
  const [closeFriends, setCloseFriends] = useState<CloseFriend[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCloseFriends = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('close_friends')
        .select(`
          *,
          profiles!friend_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setCloseFriends(data || []);
    } catch (error) {
      console.error('Error fetching close friends:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCloseFriends();
    }
  }, [user]);

  const addCloseFriend = async (friendId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('close_friends')
        .insert({ user_id: user.id, friend_id: friendId });

      if (error) throw error;

      toast({ title: "Added to close friends" });
      await fetchCloseFriends();
      return true;
    } catch (error: any) {
      console.error('Error adding close friend:', error);
      toast({ title: "Failed to add close friend", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeCloseFriend = async (friendshipId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('close_friends')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast({ title: "Removed from close friends" });
      await fetchCloseFriends();
      return true;
    } catch (error: any) {
      console.error('Error removing close friend:', error);
      toast({ title: "Failed to remove close friend", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isCloseFriend = async (friendId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('close_friends')
        .select('id')
        .eq('user_id', user.id)
        .eq('friend_id', friendId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking close friend status:', error);
      return false;
    }
  };

  return {
    closeFriends,
    loading,
    addCloseFriend,
    removeCloseFriend,
    isCloseFriend,
    refetch: fetchCloseFriends
  };
};