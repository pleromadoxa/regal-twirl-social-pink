import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import IncomingCallPopup from '@/components/IncomingCallPopup';
import { subscriptionManager } from '@/utils/subscriptionManager';

interface IncomingCall {
  id: string;
  caller_id: string;
  call_type: 'audio' | 'video' | 'group';
  room_id: string;
  caller_profile: {
    display_name: string;
    username: string;
    avatar_url: string | null;
  };
}

const WebRTCCallManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    console.log('[WebRTCCallManager] Setting up call manager for user:', user.id);

    // Clean up existing subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Listen on user-specific channel for incoming calls
    const channelName = `user-calls-${user.id}`;
    
    console.log('[WebRTCCallManager] Listening on channel:', channelName);
    
    unsubscribeRef.current = subscriptionManager.subscribe(channelName, {
      broadcast: [
        {
          event: 'incoming-call',
          callback: (payload: any) => {
            console.log('[WebRTCCallManager] Received incoming call:', payload);
            
            const callData = payload.payload;
            
            // Don't show incoming call popup for calls initiated by this user
            if (callData.caller_id === user.id) {
              return;
            }

            setIncomingCall({
              id: callData.call_id || callData.room_id,
              caller_id: callData.caller_id,
              call_type: callData.call_type || 'audio',
              room_id: callData.room_id,
              caller_profile: callData.caller_profile || {
                display_name: 'Unknown User',
                username: 'unknown',
                avatar_url: null
              }
            });

            // Show notification
            toast({
              title: `Incoming ${callData.call_type || 'audio'} call`,
              description: `${callData.caller_profile?.display_name || 'Unknown'} is calling you...`,
              duration: 10000
            });
          }
        },
        {
          event: 'incoming-group-call',
          callback: (payload: any) => {
            console.log('[WebRTCCallManager] Received incoming group call:', payload);
            
            const callData = payload.payload;
            
            if (callData.caller_id === user.id) {
              return;
            }

            setIncomingCall({
              id: callData.call_id || callData.room_id,
              caller_id: callData.caller_id,
              call_type: 'group',
              room_id: callData.room_id,
              caller_profile: callData.caller_profile || {
                display_name: 'Unknown User',
                username: 'unknown',
                avatar_url: null
              }
            });

            toast({
              title: "Incoming group call",
              description: `${callData.caller_profile?.display_name || 'Unknown'} invited you to a group call`,
              duration: 10000
            });
          }
        },
        {
          event: 'call-ended',
          callback: (payload: any) => {
            console.log('[WebRTCCallManager] Call ended:', payload);
            setIncomingCall(null);
          }
        },
        {
          event: 'call-declined',
          callback: (payload: any) => {
            console.log('[WebRTCCallManager] Call declined:', payload);
            setIncomingCall(null);
          }
        }
      ]
    });

    return () => {
      console.log('[WebRTCCallManager] Cleaning up call manager');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.id, toast]);

  const handleAcceptCall = (callId: string, callType: 'audio' | 'video' | 'group') => {
    if (!incomingCall) return;
    
    console.log('[WebRTCCallManager] Accepting call:', callId, callType);
    
    // Navigate to messages with call parameters
    const searchParams = new URLSearchParams({
      conversation: incomingCall.caller_id,
      call: callType,
      room: incomingCall.room_id
    });
    
    window.location.href = `/messages?${searchParams.toString()}`;
    
    setIncomingCall(null);
  };

  const handleDeclineCall = (callId: string) => {
    console.log('[WebRTCCallManager] Declining call:', callId);
    
    if (incomingCall) {
      // Notify caller that call was declined
      const declineChannel = supabase.channel(`call-response-${incomingCall.room_id}`);
      declineChannel.send({
        type: 'broadcast',
        event: 'call-declined',
        payload: {
          call_id: callId,
          declined_by: user?.id
        }
      });
    }
    
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <IncomingCallPopup
      callId={incomingCall.id}
      callerName={incomingCall.caller_profile.display_name || incomingCall.caller_profile.username}
      callerAvatar={incomingCall.caller_profile.avatar_url}
      callType={incomingCall.call_type}
      callerId={incomingCall.caller_id}
      onAccept={() => handleAcceptCall(incomingCall.id, incomingCall.call_type)}
      onDecline={() => handleDeclineCall(incomingCall.id)}
    />
  );
};

export default WebRTCCallManager;