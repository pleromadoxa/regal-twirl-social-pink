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
  const roomId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const { data, error } = await supabase
    .from('active_calls')
    .insert({
      caller_id: callerId,
      call_type: callType,
      participants: [callerId, ...participants],
      room_id: roomId,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating call:', error);
    throw error;
  }

  return {
    id: data.id,
    room_id: data.room_id,
    caller_id: data.caller_id,
    call_type: data.call_type as 'audio' | 'video' | 'group',
    participants: Array.isArray(data.participants) ? data.participants : JSON.parse(data.participants as string),
    status: data.status as 'active' | 'ended',
    created_at: data.created_at,
    ended_at: data.ended_at
  };
};

export const joinCall = async (callId: string, userId: string): Promise<void> => {
  // First, get the current call to access participants
  const { data: currentCall, error: fetchError } = await supabase
    .from('active_calls')
    .select('participants')
    .eq('id', callId)
    .single();

  if (fetchError) {
    console.error('Error fetching call:', fetchError);
    throw fetchError;
  }

  const currentParticipants = Array.isArray(currentCall.participants) 
    ? currentCall.participants 
    : JSON.parse(currentCall.participants as string);

  // Add the new user if not already in the call
  const updatedParticipants = currentParticipants.includes(userId) 
    ? currentParticipants 
    : [...currentParticipants, userId];

  const { error } = await supabase
    .from('active_calls')
    .update({
      participants: updatedParticipants
    })
    .eq('id', callId);

  if (error) {
    console.error('Error joining call:', error);
    throw error;
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
  onUpdate: (call: ActiveCall) => void,
  onError?: (error: Error) => void
) => {
  const channel = supabase
    .channel(`call-updates-${callId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'active_calls',
        filter: `id=eq.${callId}`
      },
      (payload) => {
        console.log('Call update received:', payload);
        const newData = payload.new as any;
        if (newData) {
          const rawParticipants = newData.participants;
          const participants = Array.isArray(rawParticipants) 
            ? rawParticipants 
            : JSON.parse(rawParticipants as string);
            
          const call: ActiveCall = {
            id: newData.id,
            room_id: newData.room_id,
            caller_id: newData.caller_id,
            call_type: newData.call_type as 'audio' | 'video' | 'group',
            participants,
            status: newData.status as 'active' | 'ended',
            created_at: newData.created_at,
            ended_at: newData.ended_at
          };
          onUpdate(call);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const checkWebRTCSupport = (): { supported: boolean; missing: string[] } => {
  const missing: string[] = [];
  let supported = true;

  if (typeof RTCPeerConnection === 'undefined') {
    missing.push('RTCPeerConnection');
    supported = false;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    missing.push('getUserMedia API');
    supported = false;
  }

  if (!window.location.protocol.includes('https') && window.location.hostname !== 'localhost') {
    missing.push('Secure context (HTTPS)');
    supported = false;
  }

  return { supported, missing };
};

export const checkSecureContext = (): boolean => {
  return window.isSecureContext || window.location.hostname === 'localhost';
};
