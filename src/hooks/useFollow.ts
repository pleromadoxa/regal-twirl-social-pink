
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFollow = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const followUser = async (userId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        variant: "destructive"
      });
      return false;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already following",
            description: "You are already following this user",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return false;
      }

      toast({
        title: "Success",
        description: "You are now following this user"
      });
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "You have unfollowed this user"
      });
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async (userId: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  };

  return {
    followUser,
    unfollowUser,
    checkFollowStatus,
    loading
  };
};
