
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
  
  console.log('[CallService] Creating call:', { callerId, callType, participants, roomId });
  
  try {
    const { data, error } = await supabase
      .from('active_calls')
      .insert({
        room_id: roomId,
        caller_id: callerId,
        call_type: callType,
        participants: participants,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('[CallService] Error creating call:', error);
      throw new Error(`Failed to create call: ${error.message}`);
    }

    console.log('[CallService] Call created successfully:', data);

    return {
      ...data,
      call_type: data.call_type as 'audio' | 'video' | 'group',
      status: data.status as 'active' | 'ended',
      participants: Array.isArray(data.participants) ? data.participants as string[] : []
    };
  } catch (error) {
    console.error('[CallService] Failed to create call:', error);
    throw error;
  }
};

export const joinCall = async (callId: string, userId: string): Promise<void> => {
  console.log('[CallService] Joining call:', { callId, userId });
  
  try {
    const { data: call, error: fetchError } = await supabase
      .from('active_calls')
      .select('participants')
      .eq('id', callId)
      .single();

    if (fetchError) {
      console.error('[CallService] Error fetching call:', fetchError);
      throw new Error(`Failed to fetch call: ${fetchError.message}`);
    }

    if (call) {
      const currentParticipants = Array.isArray(call.participants) ? call.participants as string[] : [];
      
      // Check if user is already in the call
      if (currentParticipants.includes(userId)) {
        console.log('[CallService] User already in call');
        return;
      }
      
      const updatedParticipants = [...currentParticipants, userId];
      
      const { error: updateError } = await supabase
        .from('active_calls')
        .update({ participants: updatedParticipants })
        .eq('id', callId);

      if (updateError) {
        console.error('[CallService] Error joining call:', updateError);
        throw new Error(`Failed to join call: ${updateError.message}`);
      }
      
      console.log('[CallService] Successfully joined call');
    } else {
      throw new Error('Call not found');
    }
  } catch (error) {
    console.error('[CallService] Failed to join call:', error);
    throw error;
  }
};

export const endCall = async (callId: string): Promise<void> => {
  console.log('[CallService] Ending call:', callId);
  
  try {
    const { error } = await supabase
      .from('active_calls')
      .update({ 
        status: 'ended',
        ended_at: new Date().toISOString()
      })
      .eq('id', callId);

    if (error) {
      console.error('[CallService] Error ending call:', error);
      throw new Error(`Failed to end call: ${error.message}`);
    }
    
    console.log('[CallService] Call ended successfully');
  } catch (error) {
    console.error('[CallService] Failed to end call:', error);
    throw error;
  }
};

export const subscribeToCallUpdates = (
  callId: string,
  onUpdate: (call: ActiveCall) => void,
  onError?: (error: Error) => void
) => {
  console.log('[CallService] Subscribing to call updates:', callId);
  
  const channel = supabase
    .channel(`call-${callId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'active_calls',
      filter: `id=eq.${callId}`
    }, (payload) => {
      console.log('[CallService] Call update received:', payload);
      
      try {
        if (payload.new) {
          const callData = payload.new as any;
          const formattedCall: ActiveCall = {
            ...callData,
            call_type: callData.call_type as 'audio' | 'video' | 'group',
            status: callData.status as 'active' | 'ended',
            participants: Array.isArray(callData.participants) ? callData.participants as string[] : []
          };
          
          onUpdate(formattedCall);
        }
      } catch (error) {
        console.error('[CallService] Error processing call update:', error);
        if (onError) {
          onError(error as Error);
        }
      }
    })
    .subscribe((status) => {
      console.log('[CallService] Subscription status:', status);
      
      if (status === 'CHANNEL_ERROR') {
        console.error('[CallService] Channel subscription error');
        if (onError) {
          onError(new Error('Failed to subscribe to call updates'));
        }
      }
    });

  return () => {
    console.log('[CallService] Unsubscribing from call updates');
    supabase.removeChannel(channel);
  };
};

// Helper function to check WebRTC support
export const checkWebRTCSupport = (): { supported: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  if (!navigator.mediaDevices) {
    missing.push('mediaDevices');
  }
  
  if (!navigator.mediaDevices?.getUserMedia) {
    missing.push('getUserMedia');
  }
  
  if (!window.RTCPeerConnection) {
    missing.push('RTCPeerConnection');
  }
  
  if (!window.RTCSessionDescription) {
    missing.push('RTCSessionDescription');
  }
  
  if (!window.RTCIceCandidate) {
    missing.push('RTCIceCandidate');
  }
  
  return {
    supported: missing.length === 0,
    missing
  };
};

// Helper function to check if HTTPS is enabled
export const checkSecureContext = (): boolean => {
  return window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
};
