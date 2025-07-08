
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CallHistoryEntry {
  recipient_id: string;
  conversation_id?: string;
  call_type: 'audio' | 'video';
  call_status: 'completed' | 'missed' | 'failed';
  duration_seconds: number;
  started_at: string;
  ended_at: string;
}

export const useCallHistory = () => {
  const { toast } = useToast();

  const addCallToHistory = useCallback(async (callData: CallHistoryEntry) => {
    try {
      const { error } = await supabase
        .from('call_history')
        .insert({
          caller_id: (await supabase.auth.getUser()).data.user?.id!,
          recipient_id: callData.recipient_id,
          conversation_id: callData.conversation_id,
          call_type: callData.call_type,
          call_status: callData.call_status,
          duration_seconds: callData.duration_seconds,
          started_at: callData.started_at,
          ended_at: callData.ended_at
        });

      if (error) {
        console.error('Error adding call to history:', error);
        throw error;
      }

      console.log('Call added to history successfully');
    } catch (error) {
      console.error('Failed to add call to history:', error);
      toast({
        title: "Error",
        description: "Failed to save call to history",
        variant: "destructive"
      });
    }
  }, [toast]);

  const getCallHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('call_history')
        .select(`
          *,
          caller:profiles!call_history_caller_id_fkey(username, display_name, avatar_url),
          recipient:profiles!call_history_recipient_id_fkey(username, display_name, avatar_url)
        `)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching call history:', error);
      return [];
    }
  }, []);

  return {
    addCallToHistory,
    getCallHistory
  };
};
