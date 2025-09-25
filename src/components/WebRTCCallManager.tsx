import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import IncomingCallPopup from '@/components/IncomingCallPopup';
import { useNavigate } from 'react-router-dom';
import { createMissedCallNotification } from '@/services/missedCallNotificationService';
import { mediaPermissionManager } from '@/utils/mediaPermissionManager';

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
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const channelRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || isInitializedRef.current) return;

    console.log('[WebRTCCallManager] Setting up call manager for user:', user.id);
    isInitializedRef.current = true;

    // Clean up any existing channel first
    if (channelRef.current) {
      try {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.warn('Error cleaning up existing channel:', error);
      }
      channelRef.current = null;
    }

    // Listen on user-specific channel for incoming calls with timestamp for uniqueness
    const channelName = `user-calls-${user.id}-${Date.now()}`;
    
    console.log('[WebRTCCallManager] Listening on channel:', channelName);
    
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
      .on('broadcast', { event: 'incoming-group-call' }, (payload) => {
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
      })
      .on('broadcast', { event: 'call-ended' }, (payload) => {
        console.log('[WebRTCCallManager] Call ended:', payload);
        const endedData = payload.payload;
        
        // Show notification that call ended
        if (endedData.ended_by !== user?.id) {
          toast({
            title: "Call ended",
            description: `Call ended by ${endedData.ended_by_name || 'other party'}`,
            variant: "default"
          });
        }
        
        setIncomingCall(null);
      })
      .on('broadcast', { event: 'call-accepted' }, (payload) => {
        console.log('[WebRTCCallManager] Call accepted:', payload);
        const acceptData = payload.payload;
        
        // Show notification that call was accepted
        if (acceptData.accepted_by !== user?.id) {
          toast({
            title: "Call accepted",
            description: `${acceptData.accepted_by_name || 'User'} joined the call`,
            variant: "default"
          });
        }
      })
      .subscribe(async (status) => {
        console.log('[WebRTCCallManager] Channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[WebRTCCallManager] Successfully subscribed to channel:', channelName);
        }
      });

    return () => {
      console.log('[WebRTCCallManager] Cleaning up call manager');
      isInitializedRef.current = false;
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error cleaning up channel:', error);
        }
        channelRef.current = null;
      }
    };
  }, [user?.id, toast]);

  const handleAcceptCall = async (callId: string, callType: 'audio' | 'video' | 'group') => {
    if (!incomingCall) return;
    
    console.log('[WebRTCCallManager] Accepting call:', callId, callType);
    
    try {
      // Notify caller that call was accepted
      const callerChannelName = `user-calls-${incomingCall.caller_id}`;
      const acceptChannel = supabase.channel(`call-accept-${Date.now()}`);
      
      await acceptChannel.send({
        type: 'broadcast',
        event: 'call-accepted',
        payload: {
          call_id: callId,
          room_id: incomingCall.room_id,
          accepted_by: user?.id,
          accepted_by_name: profile?.display_name || profile?.username || 'Unknown User'
        }
      });

      console.log('[WebRTCCallManager] Call accept notification sent');
    } catch (error) {
      console.error('[WebRTCCallManager] Error sending accept notification:', error);
    }
    
    // Navigate using React Router instead of window.location.href to prevent page refresh
    const searchParams = new URLSearchParams({
      conversation: incomingCall.caller_id,
      call: callType,
      room: incomingCall.room_id
    });
    
    navigate(`/messages?${searchParams.toString()}`);
    
    setIncomingCall(null);
  };

  const handleDeclineCall = async (callId: string) => {
    console.log('[WebRTCCallManager] Declining call:', callId);
    
    if (incomingCall) {
      try {
        // Notify caller that call was declined via their channel
        const callerChannelName = `user-calls-${incomingCall.caller_id}`;
        const declineChannel = supabase.channel(`call-decline-${Date.now()}`);
        
        await declineChannel.send({
          type: 'broadcast',
          event: 'call-declined',
          payload: {
            call_id: callId,
            room_id: incomingCall.room_id,
            declined_by: user?.id,
            declined_by_name: profile?.display_name || profile?.username || 'Unknown User'
          }
        });

        // Also notify on the caller's dedicated channel
        const callerNotificationChannel = supabase.channel(callerChannelName);
        await callerNotificationChannel.send({
          type: 'broadcast',
          event: 'call-declined',
          payload: {
            call_id: callId,
            room_id: incomingCall.room_id,
            declined_by: user?.id,
            declined_by_name: profile?.display_name || profile?.username || 'Unknown User'
          }
        });

        console.log('[WebRTCCallManager] Call decline notification sent');

        // Create missed call notification in the conversation
        await createMissedCallNotification({
          callId: callId,
          callerId: incomingCall.caller_id,
          receiverId: user?.id || '',
          callType: incomingCall.call_type === 'video' ? 'video' : 'audio',
          duration: 0
        });

        // Cleanup any active media streams to prevent permission conflicts
        mediaPermissionManager.cleanupAllStreams();

      } catch (error) {
        console.error('[WebRTCCallManager] Error sending decline notification:', error);
      }
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