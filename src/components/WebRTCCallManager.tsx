
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import IncomingCallPopup from '@/components/IncomingCallPopup';

interface IncomingCall {
  id: string;
  caller_id: string;
  call_type: 'audio' | 'video';
  room_id: string;
  caller_profile: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

const WebRTCCallManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user?.id) return;

    console.log('[WebRTCCallManager] Setting up call manager for user:', user.id);

    // Listen on user-specific channel for incoming calls
    const channelName = `user-calls-${user.id}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on('broadcast', { event: 'incoming-call' }, (payload) => {
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
      })
      .on('broadcast', { event: 'call-ended' }, (payload) => {
        console.log('[WebRTCCallManager] Call ended:', payload);
        setIncomingCall(null);
      })
      .on('broadcast', { event: 'call-declined' }, (payload) => {
        console.log('[WebRTCCallManager] Call declined:', payload);
        setIncomingCall(null);
      })
      .subscribe();

    return () => {
      console.log('[WebRTCCallManager] Cleaning up call manager');
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error removing call manager channel:', error);
        }
        channelRef.current = null;
      }
    };
  }, [user?.id, toast]);

  const handleAcceptCall = (callId: string, callType: 'audio' | 'video') => {
    console.log('[WebRTCCallManager] Accepting call:', callId, callType);
    
    setIncomingCall(null);
    
    // Redirect to messages page with call parameters
    const params = new URLSearchParams({
      call: callType,
      conversation: callId,
      incoming: 'true'
    });
    
    window.location.href = `/messages?${params.toString()}`;
  };

  const handleDeclineCall = (callId: string) => {
    console.log('[WebRTCCallManager] Declining call:', callId);
    
    setIncomingCall(null);
    
    // Notify the caller that call was declined
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'call-declined',
        payload: {
          call_id: callId,
          declined_by: user?.id
        }
      });
    }

    toast({
      title: "Call declined",
      description: "You declined the incoming call"
    });
  };

  return (
    <>
      {incomingCall && (
        <IncomingCallPopup
          callId={incomingCall.id}
          callerName={incomingCall.caller_profile.display_name || incomingCall.caller_profile.username || 'Unknown User'}
          callerAvatar={incomingCall.caller_profile.avatar_url}
          callType={incomingCall.call_type}
          onAccept={() => handleAcceptCall(incomingCall.id, incomingCall.call_type)}
          onDecline={() => handleDeclineCall(incomingCall.id)}
        />
      )}
    </>
  );
};

export default WebRTCCallManager;
