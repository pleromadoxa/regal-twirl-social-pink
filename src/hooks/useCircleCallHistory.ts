import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CircleCallHistoryItem {
  id: string;
  circle_id: string;
  caller_id: string;
  room_id: string;
  call_type: 'audio' | 'video';
  participants: string[];
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  status: 'active' | 'ended' | 'missed';
  caller_profile?: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  circle?: {
    name: string;
    color: string;
  };
}

export const useCircleCallHistory = (circleId?: string) => {
  const [callHistory, setCallHistory] = useState<CircleCallHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCallHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('circle_call_history')
        .select('*')
        .order('started_at', { ascending: false });

      if (circleId) {
        query = query.eq('circle_id', circleId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch related data
      if (data && data.length > 0) {
        const callerIds = [...new Set(data.map(call => call.caller_id))];
        const circleIds = [...new Set(data.map(call => call.circle_id))];

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', callerIds);

        const { data: circles } = await supabase
          .from('user_circles')
          .select('id, name, color')
          .in('id', circleIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        const circleMap = new Map(circles?.map(c => [c.id, c]) || []);

        const enrichedHistory = data.map(call => ({
          ...call,
          call_type: call.call_type as 'audio' | 'video',
          status: call.status as 'active' | 'ended' | 'missed',
          caller_profile: profileMap.get(call.caller_id),
          circle: circleMap.get(call.circle_id),
        }));

        setCallHistory(enrichedHistory);
      } else {
        setCallHistory([]);
      }
    } catch (error) {
      console.error('Error fetching circle call history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load call history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const endCall = async (callHistoryId: string) => {
    try {
      const { error } = await supabase
        .from('circle_call_history')
        .update({
          ended_at: new Date().toISOString(),
          status: 'ended',
        })
        .eq('id', callHistoryId);

      if (error) throw error;

      await fetchCallHistory();
    } catch (error) {
      console.error('Error ending call:', error);
      toast({
        title: 'Error',
        description: 'Failed to end call',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchCallHistory();

    // Set up realtime subscription
    const channel = supabase
      .channel('circle_call_history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'circle_call_history',
        },
        () => {
          fetchCallHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, circleId]);

  return {
    callHistory,
    loading,
    refetch: fetchCallHistory,
    endCall,
  };
};
