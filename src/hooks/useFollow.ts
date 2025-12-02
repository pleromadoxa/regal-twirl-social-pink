
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

    if (user.id === userId) {
      toast({
        title: "Cannot follow yourself",
        description: "You cannot follow your own account",
        variant: "destructive"
      });
      return false;
    }

    try {
      setLoading(true);
      
      // Check if already following
      const { data: existingFollow, error: checkError } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingFollow) {
        toast({
          title: "Already following",
          description: "You are already following this user",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) {
        console.error('Follow error:', error);
        throw error;
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
        description: "Failed to follow user. Please try again.",
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

      if (error) {
        console.error('Unfollow error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "You have unfollowed this user"
      });
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async (userId: string) => {
    if (!user || user.id === userId) return false;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking follow status:', error);
        return false;
      }
      
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
