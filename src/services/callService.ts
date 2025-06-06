
import { supabase } from '@/integrations/supabase/client';

export interface ActiveCall {
  id: string;
  room_id: string;
  caller_id: string;
  call_type: 'audio' | 'video' | 'group';
  participants: string[];
  status: 'active' | 'ended';
  created_at: string;
  ended_at?: string;
}

export const createCall = async (
  callerId: string,
  callType: 'audio' | 'video' | 'group',
  participants: string[] = []
): Promise<ActiveCall> => {
  const roomId = `call-${Date.now()}-${callerId}`;
  
  const { data, error } = await supabase
    .from('active_calls')
    .insert({
      room_id: roomId,
      caller_id: callerId,
      call_type: callType,
      participants: participants
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating call:', error);
    throw error;
  }

  return {
    ...data,
    call_type: data.call_type as 'audio' | 'video' | 'group',
    status: data.status as 'active' | 'ended',
    participants: Array.isArray(data.participants) ? data.participants as string[] : []
  };
};

export const joinCall = async (callId: string, userId: string): Promise<void> => {
  const { data: call } = await supabase
    .from('active_calls')
    .select('participants')
    .eq('id', callId)
    .single();

  if (call) {
    const currentParticipants = Array.isArray(call.participants) ? call.participants as string[] : [];
    const updatedParticipants = [...currentParticipants, userId];
    
    const { error } = await supabase
      .from('active_calls')
      .update({ participants: updatedParticipants })
      .eq('id', callId);

    if (error) {
      console.error('Error joining call:', error);
      throw error;
    }
  }
};

export const endCall = async (callId: string): Promise<void> => {
  const { error } = await supabase
    .from('active_calls')
    .update({ 
      status: 'ended',
      ended_at: new Date().toISOString()
    })
    .eq('id', callId);

  if (error) {
    console.error('Error ending call:', error);
    throw error;
  }
};

export const subscribeToCallUpdates = (
  callId: string,
  onUpdate: (call: ActiveCall) => void
) => {
  const channel = supabase
    .channel(`call-${callId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'active_calls',
      filter: `id=eq.${callId}`
    }, (payload) => {
      console.log('Call update:', payload);
      if (payload.new) {
        const callData = payload.new as any;
        onUpdate({
          ...callData,
          call_type: callData.call_type as 'audio' | 'video' | 'group',
          status: callData.status as 'active' | 'ended',
          participants: Array.isArray(callData.participants) ? callData.participants as string[] : []
        });
      }
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
};
