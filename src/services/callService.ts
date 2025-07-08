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
  // Placeholder - calls are disabled
  throw new Error('Call functionality is disabled');
};

export const joinCall = async (callId: string, userId: string): Promise<void> => {
  // Placeholder - calls are disabled
  throw new Error('Call functionality is disabled');
};

export const endCall = async (callId: string): Promise<void> => {
  // Placeholder - calls are disabled
  throw new Error('Call functionality is disabled');
};

export const subscribeToCallUpdates = (
  callId: string,
  onUpdate: (call: ActiveCall) => void,
  onError?: (error: Error) => void
) => {
  // Placeholder - calls are disabled
  return () => {};
};

export const checkWebRTCSupport = (): { supported: boolean; missing: string[] } => {
  return {
    supported: false,
    missing: ['Call functionality disabled']
  };
};

export const checkSecureContext = (): boolean => {
  return false;
};
