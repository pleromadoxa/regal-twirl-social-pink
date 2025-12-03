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
  console.log('[callService] Creating call:', { callerId, callType, participants });
  
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
    console.error('[callService] Error creating call:', error);
    throw error;
  }

  console.log('[callService] Call created successfully:', data);

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
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching call:', fetchError);
    throw fetchError;
  }

  if (!currentCall) {
    throw new Error('Call not found');
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

export const checkWebRTCSupport = (): { supported: boolean; missing: string[]; warnings: string[] } => {
  const missing: string[] = [];
  const warnings: string[] = [];
  let supported = true;

  // Detect browser and OS
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isChrome = /chrome/.test(userAgent);
  const isFirefox = /firefox/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isMobile = /mobile|android|iphone|ipad|ipod/.test(userAgent);

  // Check RTCPeerConnection with mobile browser compatibility
  if (typeof RTCPeerConnection === 'undefined' && 
      typeof webkitRTCPeerConnection === 'undefined' && 
      typeof mozRTCPeerConnection === 'undefined') {
    missing.push('RTCPeerConnection');
    supported = false;
  }

  // Check getUserMedia with legacy support
  if (!navigator.mediaDevices?.getUserMedia && 
      !navigator.getUserMedia && 
      !navigator.webkitGetUserMedia && 
      !navigator.mozGetUserMedia) {
    missing.push('getUserMedia API');
    supported = false;
  }

  // Enhanced secure context check
  if (!window.isSecureContext && 
      !window.location.protocol.includes('https') && 
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1') {
    missing.push('Secure context (HTTPS required for mobile calls)');
    supported = false;
  }

  // Mobile-specific checks and warnings
  if (isMobile) {
    // iOS Safari specific limitations
    if (isIOS && isSafari) {
      const version = userAgent.match(/version\/(\d+)/);
      const safariVersion = version ? parseInt(version[1]) : 0;
      
      if (safariVersion < 11) {
        missing.push('Safari 11+ required for WebRTC on iOS');
        supported = false;
      } else if (safariVersion < 14) {
        warnings.push('iOS Safari version may have limited WebRTC features');
      }
    }

    // Android Chrome checks
    if (isAndroid && isChrome) {
      const chromeVersion = userAgent.match(/chrome\/(\d+)/);
      const version = chromeVersion ? parseInt(chromeVersion[1]) : 0;
      
      if (version < 56) {
        missing.push('Chrome 56+ required for reliable mobile WebRTC');
        supported = false;
      }
    }

    // Check for camera/microphone availability
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const hasAudio = devices.some(device => device.kind === 'audioinput');
        const hasVideo = devices.some(device => device.kind === 'videoinput');
        
        if (!hasAudio) warnings.push('No microphone detected');
        if (!hasVideo) warnings.push('No camera detected');
      }).catch(() => {
        warnings.push('Could not enumerate media devices');
      });
    }

    // Mobile-specific warnings
    if (isMobile) {
      warnings.push('Mobile calls may require user interaction to start');
      if (isIOS) {
        warnings.push('iOS may require speaker mode for audio calls');
      }
    }
  }

  return { supported, missing, warnings };
};

export const checkSecureContext = (): boolean => {
  return window.isSecureContext || window.location.hostname === 'localhost';
};
