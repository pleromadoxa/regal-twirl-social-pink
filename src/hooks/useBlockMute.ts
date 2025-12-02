import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useBlockMute = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const blockUser = async (userId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          user_id: user.id,
          blocked_user_id: userId
        });

      if (error) throw error;

      toast({
        title: "User blocked",
        description: "You will no longer see content from this user"
      });
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (userId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('user_id', user.id)
        .eq('blocked_user_id', userId);

      if (error) throw error;

      toast({
        title: "User unblocked",
        description: "You can now see content from this user again"
      });
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: "Failed to unblock user. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const muteUser = async (userId: string, duration?: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      
      // Calculate muted_until based on duration
      let muted_until = null;
      if (duration && duration !== 'permanent') {
        const now = new Date();
        switch (duration) {
          case '1h':
            muted_until = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
            break;
          case '24h':
            muted_until = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
            break;
          case '7d':
            muted_until = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case '30d':
            muted_until = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
            break;
        }
      }

      const { error } = await supabase
        .from('muted_users')
        .insert({
          user_id: user.id,
          muted_user_id: userId,
          mute_duration: duration || 'permanent',
          muted_until
        });

      if (error) throw error;

      toast({
        title: "User muted",
        description: "You will no longer see notifications from this user"
      });
      return true;
    } catch (error) {
      console.error('Error muting user:', error);
      toast({
        title: "Error",
        description: "Failed to mute user. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unmuteUser = async (userId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('muted_users')
        .delete()
        .eq('user_id', user.id)
        .eq('muted_user_id', userId);

      if (error) throw error;

      toast({
        title: "User unmuted",
        description: "You will now receive notifications from this user again"
      });
      return true;
    } catch (error) {
      console.error('Error unmuting user:', error);
      toast({
        title: "Error",
        description: "Failed to unmute user. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkBlockStatus = async (userId: string) => {
    if (!user || user.id === userId) return false;

    try {
      const { data } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('user_id', user.id)
        .eq('blocked_user_id', userId)
        .maybeSingle();

      return !!data;
    } catch (error) {
      return false;
    }
  };

  const checkMuteStatus = async (userId: string) => {
    if (!user || user.id === userId) return false;

    try {
      const { data } = await supabase
        .from('muted_users')
        .select('id')
        .eq('user_id', user.id)
        .eq('muted_user_id', userId)
        .maybeSingle();

      return !!data;
    } catch (error) {
      return false;
    }
  };

  return {
    blockUser,
    unblockUser,
    muteUser,
    unmuteUser,
    checkBlockStatus,
    checkMuteStatus,
    loading
  };
};
