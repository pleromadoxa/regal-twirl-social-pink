import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CircleInvitation {
  id: string;
  circle_id: string;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  created_at: string;
  responded_at?: string;
  user_circles?: {
    name: string;
    color: string;
  };
  inviter_profile?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const useCircleInvitations = () => {
  const [invitations, setInvitations] = useState<CircleInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setInvitations([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('circle_invitations')
        .select('*')
        .eq('invitee_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch related data separately
      if (data && data.length > 0) {
        const circleIds = [...new Set(data.map(inv => inv.circle_id))];
        const inviterIds = [...new Set(data.map(inv => inv.inviter_id))];
        
        const { data: circles } = await supabase
          .from('user_circles')
          .select('id, name, color')
          .in('id', circleIds);
          
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', inviterIds);

        const circleMap = new Map(circles?.map(c => [c.id, c]) || []);
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        const invitationsWithData = data.map(inv => ({
          ...inv,
          status: inv.status as 'pending' | 'accepted' | 'declined',
          user_circles: circleMap.get(inv.circle_id),
          inviter_profile: profileMap.get(inv.inviter_id),
        }));
        
        setInvitations(invitationsWithData as any);
      } else {
        setInvitations([]);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (circleId: string, userId: string, message?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('circle_invitations')
        .insert({
          circle_id: circleId,
          inviter_id: user.id,
          invitee_id: userId,
          message,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
      });

      return true;
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
      return false;
    }
  };

  const respondToInvitation = async (invitationId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('circle_invitations')
        .update({ status, responded_at: new Date().toISOString() })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Invitation ${status}`,
      });

      fetchInvitations();
      return true;
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to respond to invitation',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    const setupSubscription = async () => {
      await fetchInvitations();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use unique channel name per user to avoid conflicts
      const channelName = `circle_invitations:${user.id}`;
      
      console.log('[useCircleInvitations] Setting up subscription:', channelName);

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'circle_invitations',
            filter: `invitee_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('[useCircleInvitations] New invitation received:', payload);
            fetchInvitations();
          }
        )
        .subscribe((status) => {
          console.log('[useCircleInvitations] Subscription status:', status);
        });

      return channel;
    };

    let channel: any;
    setupSubscription().then(ch => {
      channel = ch;
    });

    return () => {
      if (channel) {
        console.log('[useCircleInvitations] Cleaning up subscription');
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return {
    invitations,
    loading,
    sendInvitation,
    respondToInvitation,
    refetch: fetchInvitations,
  };
};
