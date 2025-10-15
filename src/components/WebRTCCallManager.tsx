import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import IncomingCallPopup from '@/components/IncomingCallPopup';
import IncomingCircleCallPopup from '@/components/IncomingCircleCallPopup';
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

interface IncomingCircleCall {
  id: string;
  caller_id: string;
  circle_id: string;
  circle_name: string;
  call_type: 'audio' | 'video';
  room_id: string;
  member_count: number;
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
  const [incomingCircleCall, setIncomingCircleCall] = useState<IncomingCircleCall | null>(null);
  const channelRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || isInitializedRef.current) return;

    console.log('[WebRTCCallManager] Setting up call manager for user:', user.id);
    isInitializedRef.current = true;

    // Clean up any existing channel first
    if (channelRef.current) {
      try {
        console.log('[WebRTCCallManager] Cleaning up existing channel');
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.warn('[WebRTCCallManager] Error cleaning up existing channel:', error);
      }
      channelRef.current = null;
    }

    // Listen on user-specific channel for incoming calls - use consistent name without timestamp
    const channelName = `user-calls-${user.id}`;
    
    console.log('[WebRTCCallManager] Listening on channel:', channelName);
    
    channelRef.current = supabase
      .channel(channelName)
      .on('broadcast', { event: 'incoming-call' }, (payload) => {
        console.log('[WebRTCCallManager] Received incoming call:', payload);
        
        const callData = payload.payload;
        
        // Don't show incoming call popup for calls initiated by this user
        if (callData.caller_id === user.id) {
          console.log('[WebRTCCallManager] Ignoring self-initiated call');
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
          console.log('[WebRTCCallManager] Ignoring self-initiated group call');
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
      .on('broadcast', { event: 'incoming-circle-call' }, (payload) => {
        console.log('[WebRTCCallManager] Received incoming circle call:', payload);
        
        const callData = payload.payload;
        
        if (callData.caller_id === user.id) {
          console.log('[WebRTCCallManager] Ignoring self-initiated circle call');
          return;
        }

        setIncomingCircleCall({
          id: callData.call_id || callData.room_id,
          caller_id: callData.caller_id,
          circle_id: callData.circle_id,
          circle_name: callData.circle_name || 'Circle',
          call_type: callData.call_type || 'audio',
          room_id: callData.room_id,
          member_count: callData.participants?.length || 0,
          caller_profile: callData.caller_profile || {
            display_name: 'Unknown User',
            username: 'unknown',
            avatar_url: null
          }
        });

        toast({
          title: `Incoming ${callData.circle_name} call`,
          description: `${callData.caller_profile?.display_name || 'Unknown'} is calling the circle`,
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
      .on('broadcast', { event: 'call-declined' }, (payload) => {
        console.log('[WebRTCCallManager] Call declined:', payload);
        const declinedData = payload.payload;
        
        // Show notification that call was declined
        if (declinedData.declined_by !== user?.id) {
          const reason = declinedData.reason === 'busy' 
            ? 'is busy right now' 
            : 'declined the call';
          
          toast({
            title: "Call Declined",
            description: `${declinedData.declined_by_name || 'User'} ${reason}`,
            variant: "destructive",
            duration: 5000
          });
        }
        
        setIncomingCall(null);
      })
      .subscribe(async (status) => {
        console.log('[WebRTCCallManager] Channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[WebRTCCallManager] Successfully subscribed to channel:', channelName);
          
          // Test channel connection
          try {
            const testResult = await channelRef.current.send({
              type: 'broadcast',
              event: 'connection-test',
              payload: { userId: user.id, timestamp: Date.now() }
            });
            console.log('[WebRTCCallManager] Channel test result:', testResult);
          } catch (error) {
            console.error('[WebRTCCallManager] Channel test failed:', error);
          }
          
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[WebRTCCallManager] Channel error on:', channelName);
          toast({
            title: "Connection Error",
            description: "Unable to establish real-time connection for calls",
            variant: "destructive"
          });
        } else if (status === 'TIMED_OUT') {
          console.error('[WebRTCCallManager] Channel subscription timed out:', channelName);
          toast({
            title: "Connection Timeout",
            description: "Call connection timed out. Please try again.",
            variant: "destructive"
          });
        } else if (status === 'CLOSED') {
          console.warn('[WebRTCCallManager] Channel closed:', channelName);
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
      // Create a persistent broadcast channel for call signaling
      const roomChannel = supabase.channel(`call-room-${incomingCall.room_id}`);
      
      // Subscribe and broadcast acceptance
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Channel subscription timeout'));
        }, 5000);
        
        roomChannel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout);
            
            // Broadcast to room that call was accepted
            await roomChannel.send({
              type: 'broadcast',
              event: 'call-accepted',
              payload: {
                call_id: callId,
                room_id: incomingCall.room_id,
                accepted_by: user?.id,
                accepted_by_name: profile?.display_name || profile?.username || 'Unknown User',
                timestamp: Date.now()
              }
            });
            
            console.log('[WebRTCCallManager] Call acceptance broadcasted to room');
            resolve();
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            clearTimeout(timeout);
            reject(new Error(`Channel error: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('[WebRTCCallManager] Error sending accept notification:', error);
    }
    
    // Find the conversation between caller and current user
    let conversationId = incomingCall.caller_id; // fallback to caller_id
    
    if (callType !== 'group') {
      try {
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id')
          .or(`and(participant_1.eq.${user?.id},participant_2.eq.${incomingCall.caller_id}),and(participant_1.eq.${incomingCall.caller_id},participant_2.eq.${user?.id})`);
        
        if (conversations && conversations.length > 0) {
          conversationId = conversations[0].id;
          console.log('[WebRTCCallManager] Found conversation:', conversationId);
        } else {
          console.error('[WebRTCCallManager] No conversation found between users');
          toast({
            title: "Error",
            description: "Could not find conversation",
            variant: "destructive"
          });
          setIncomingCall(null);
          return;
        }
      } catch (error) {
        console.error('[WebRTCCallManager] Error finding conversation:', error);
        toast({
          title: "Error",
          description: "Failed to find conversation",
          variant: "destructive"
        });
        setIncomingCall(null);
        return;
      }
    }
    
    // Navigate using React Router instead of window.location.href to prevent page refresh
    const searchParams = new URLSearchParams({
      conversation: conversationId,
      call: callType === 'group' ? 'audio' : callType,
      room: incomingCall.room_id
    });
    
    if (callType === 'group') {
      searchParams.set('type', 'group');
    }
    
    navigate(`/messages?${searchParams.toString()}`);
    
    setIncomingCall(null);
  };

  const handleDeclineCall = async (callId: string) => {
    console.log('[WebRTCCallManager] Declining call:', callId);
    
    if (incomingCall) {
      try {
        // Create a persistent broadcast channel for call signaling
        const roomChannel = supabase.channel(`call-room-${incomingCall.room_id}`);
        
        // Subscribe and broadcast decline
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Channel subscription timeout'));
          }, 5000);
          
          roomChannel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              clearTimeout(timeout);
              
              // Broadcast to room that call was declined
              await roomChannel.send({
                type: 'broadcast',
                event: 'call-declined',
                payload: {
                  call_id: callId,
                  room_id: incomingCall.room_id,
                  declined_by: user?.id,
                  declined_by_name: profile?.display_name || profile?.username || 'Unknown User',
                  reason: 'busy',
                  timestamp: Date.now()
                }
              });

              console.log('[WebRTCCallManager] Call decline broadcasted to room');
              resolve();
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              clearTimeout(timeout);
              reject(new Error(`Channel error: ${status}`));
            }
          });
        });

        // Send busy notification to the caller (for notifications table)
        console.log('[WebRTCCallManager] Sending busy notification to caller');
        await supabase.functions.invoke('send-busy-notification', {
          body: {
            callerId: incomingCall.caller_id,
            declinedBy: user?.id,
            declinedByName: profile?.display_name || profile?.username || 'Unknown User'
          }
        });

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

        // Show toast notification
        toast({
          title: "Call Declined",
          description: `You declined the call from ${incomingCall.caller_profile?.display_name || 'Unknown User'}`,
        });

      } catch (error) {
        console.error('[WebRTCCallManager] Error sending decline notification:', error);
      }
    }
    
    setIncomingCall(null);
  };

  const handleAcceptCircleCall = () => {
    console.log('[WebRTCCallManager] Accepting circle call');
    setIncomingCircleCall(null);
  };

  const handleDeclineCircleCall = async () => {
    console.log('[WebRTCCallManager] Declining circle call');
    
    if (incomingCircleCall) {
      try {
        // Create missed call notification
        await supabase.from('notifications').insert({
          user_id: incomingCircleCall.caller_id,
          type: 'missed_circle_call',
          actor_id: user?.id,
          message: `${profile?.display_name || profile?.username || 'Someone'} declined the ${incomingCircleCall.circle_name} call`,
          data: {
            circle_id: incomingCircleCall.circle_id,
            circle_name: incomingCircleCall.circle_name,
            call_type: incomingCircleCall.call_type,
            room_id: incomingCircleCall.room_id,
          }
        });

        // Notify caller
        const callerChannelName = `user-calls-${incomingCircleCall.caller_id}`;
        const declineChannel = supabase.channel(`circle-call-decline-${Date.now()}`);
        
        await new Promise<void>((resolve) => {
          declineChannel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await declineChannel.send({
                type: 'broadcast',
                event: 'circle-call-declined',
                payload: {
                  call_id: incomingCircleCall.id,
                  room_id: incomingCircleCall.room_id,
                  declined_by: user?.id,
                  declined_by_name: profile?.display_name || profile?.username || 'Unknown User'
                }
              });
              resolve();
            }
          });
        });
      } catch (error) {
        console.error('[WebRTCCallManager] Error declining circle call:', error);
      }
    }
    
    setIncomingCircleCall(null);
  };

  if (!incomingCall && !incomingCircleCall) return null;

  return (
    <>
      {incomingCall && (
        <IncomingCallPopup
          callId={incomingCall.id}
          callerName={incomingCall.caller_profile?.display_name || incomingCall.caller_profile?.username || 'Unknown User'}
          callerAvatar={incomingCall.caller_profile?.avatar_url}
          callType={incomingCall.call_type}
          callerId={incomingCall.caller_id}
          onAccept={() => handleAcceptCall(incomingCall.id, incomingCall.call_type)}
          onDecline={() => handleDeclineCall(incomingCall.id)}
        />
      )}
      
      {incomingCircleCall && (
        <IncomingCircleCallPopup
          callId={incomingCircleCall.id}
          callerId={incomingCircleCall.caller_id}
          circleName={incomingCircleCall.circle_name}
          circleId={incomingCircleCall.circle_id}
          roomId={incomingCircleCall.room_id}
          callType={incomingCircleCall.call_type}
          callerProfile={incomingCircleCall.caller_profile}
          memberCount={incomingCircleCall.member_count}
          onAccept={handleAcceptCircleCall}
          onDecline={handleDeclineCircleCall}
        />
      )}
    </>
  );
};

export default WebRTCCallManager;