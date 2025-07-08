
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

interface CallRecord {
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
  caller?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  recipient?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const useCallHistory = () => {
  const { toast } = useToast();

  const { data: callHistory = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['call-history'],
    queryFn: async (): Promise<CallRecord[]> => {
      // First get the call history records
      const { data: calls, error: callsError } = await supabase
        .from('call_history')
        .select('*')
        .order('started_at', { ascending: false });

      if (callsError) {
        console.error('Error fetching call history:', callsError);
        throw callsError;
      }

      if (!calls || calls.length === 0) {
        return [];
      }

      // Get unique user IDs
      const userIds = Array.from(new Set([
        ...calls.map(call => call.caller_id),
        ...calls.map(call => call.recipient_id)
      ]));

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profiles rather than failing completely
      }

      // Map profiles by ID for easy lookup
      const profileMap = (profiles || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Combine call data with profile data
      const callsWithProfiles = calls.map(call => ({
        ...call,
        caller: profileMap[call.caller_id] || null,
        recipient: profileMap[call.recipient_id] || null
      }));

      return callsWithProfiles;
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
      // Use the same logic as the main query
      const { data: calls, error: callsError } = await supabase
        .from('call_history')
        .select('*')
        .order('started_at', { ascending: false });

      if (callsError) throw callsError;
      if (!calls) return [];

      const userIds = Array.from(new Set([
        ...calls.map(call => call.caller_id),
        ...calls.map(call => call.recipient_id)
      ]));

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      const profileMap = (profiles || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      return calls.map(call => ({
        ...call,
        caller: profileMap[call.caller_id] || null,
        recipient: profileMap[call.recipient_id] || null
      }));
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
