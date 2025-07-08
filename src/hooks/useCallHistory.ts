
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
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

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

interface CallHistoryWithProfiles {
  id: string;
  caller_id: string;
  recipient_id: string;
  conversation_id: string | null;
  call_type: string;
  call_status: string;
  duration_seconds: number | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  caller: Profile | null;
  recipient: Profile | null;
}

export const useCallHistory = () => {
  const { toast } = useToast();

  const { data: callHistory = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['call-history'],
    queryFn: async (): Promise<CallHistoryWithProfiles[]> => {
      // First, fetch call history
      const { data: callHistoryData, error: callHistoryError } = await supabase
        .from('call_history')
        .select('*')
        .order('started_at', { ascending: false });

      if (callHistoryError) {
        console.error('Error fetching call history:', callHistoryError);
        throw callHistoryError;
      }

      if (!callHistoryData || callHistoryData.length === 0) {
        return [];
      }

      // Get unique user IDs from caller_id and recipient_id
      const userIds = Array.from(new Set([
        ...callHistoryData.map(call => call.caller_id),
        ...callHistoryData.map(call => call.recipient_id)
      ]));

      // Fetch profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profiles if there's an error
      }

      // Create a map of profiles by ID for quick lookup
      const profilesMap = new Map<string, Profile>();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      // Combine call history with profile data
      const enrichedCallHistory: CallHistoryWithProfiles[] = callHistoryData.map(call => ({
        ...call,
        caller: profilesMap.get(call.caller_id) || null,
        recipient: profilesMap.get(call.recipient_id) || null
      }));

      return enrichedCallHistory;
    }
  });

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
      refetch(); // Refresh the call history after adding
    } catch (error) {
      console.error('Failed to add call to history:', error);
      toast({
        title: "Error",
        description: "Failed to save call to history",
        variant: "destructive"
      });
    }
  }, [toast, refetch]);

  const getCallHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('call_history')
        .select('*')
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching call history:', error);
      return [];
    }
  }, []);

  return {
    callHistory,
    loading,
    refetch,
    addCallToHistory,
    getCallHistory
  };
};
