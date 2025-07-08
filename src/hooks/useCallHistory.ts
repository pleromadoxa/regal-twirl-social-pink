
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CallHistoryEntry {
  id: string;
  caller_id: string;
  recipient_id: string;
  conversation_id: string;
  call_type: 'audio' | 'video';
  call_status: 'completed' | 'missed' | 'declined' | 'failed';
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  caller_profile?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
  recipient_profile?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const useCallHistory = () => {
  const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCallHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: historyData, error } = await supabase
        .from('call_history')
        .select('*')
        .or(`caller_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching call history:', error);
        return;
      }

      // Enrich with profile data
      const enrichedHistory = await Promise.all(
        (historyData || []).map(async (call) => {
          const [callerProfile, recipientProfile] = await Promise.all([
            supabase
              .from('profiles')
              .select('username, display_name, avatar_url')
              .eq('id', call.caller_id)
              .single(),
            supabase
              .from('profiles')
              .select('username, display_name, avatar_url')
              .eq('id', call.recipient_id)
              .single()
          ]);

          return {
            ...call,
            call_type: call.call_type as 'audio' | 'video',
            call_status: call.call_status as 'completed' | 'missed' | 'declined' | 'failed',
            caller_profile: callerProfile.data,
            recipient_profile: recipientProfile.data
          } as CallHistoryEntry;
        })
      );

      setCallHistory(enrichedHistory);
    } catch (error) {
      console.error('Error in fetchCallHistory:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCallToHistory = async (callData: {
    recipient_id: string;
    conversation_id?: string;
    call_type: 'audio' | 'video';
    call_status: 'completed' | 'missed' | 'declined' | 'failed';
    duration_seconds?: number;
    started_at: string;
    ended_at?: string;
  }) => {
    if (!user) return;

    try {
      console.log('Adding call to history:', callData);
      
      const { error } = await supabase
        .from('call_history')
        .insert({
          caller_id: user.id,
          recipient_id: callData.recipient_id,
          conversation_id: callData.conversation_id,
          call_type: callData.call_type,
          call_status: callData.call_status,
          duration_seconds: callData.duration_seconds || 0,
          started_at: callData.started_at,
          ended_at: callData.ended_at
        });

      if (error) {
        console.error('Error adding call to history:', error);
        return;
      }

      console.log('Call added to history successfully');
      // Refresh history
      await fetchCallHistory();
    } catch (error) {
      console.error('Error in addCallToHistory:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCallHistory();

      // Set up real-time subscription for call history updates
      const subscription = supabase
        .channel('call-history-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'call_history',
          filter: `caller_id=eq.${user.id}`
        }, (payload) => {
          console.log('Call history update for caller:', payload);
          fetchCallHistory();
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'call_history',
          filter: `recipient_id=eq.${user.id}`
        }, (payload) => {
          console.log('Call history update for recipient:', payload);
          fetchCallHistory();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  return {
    callHistory,
    loading,
    addCallToHistory,
    refetch: fetchCallHistory
  };
};
