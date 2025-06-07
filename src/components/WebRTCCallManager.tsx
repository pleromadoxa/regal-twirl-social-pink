
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import IncomingCallPopup from './IncomingCallPopup';

interface ActiveCall {
  id: string;
  caller_id: string;
  call_type: 'audio' | 'video';
  status: 'active' | 'ended';
  participants: string[];
  room_id: string;
}

interface CallerProfile {
  username: string;
  display_name: string;
  avatar_url: string;
}

const WebRTCCallManager = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [incomingCall, setIncomingCall] = useState<ActiveCall | null>(null);
  const [callerProfile, setCallerProfile] = useState<CallerProfile | null>(null);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Don't set up the channel if auth is loading or user is not available
    if (loading || !user) {
      return;
    }

    console.log('Setting up WebRTC call manager for user:', user.id);

    // Clean up any existing channel first
    if (channelRef.current) {
      console.log('Cleaning up existing channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create a unique channel name to avoid conflicts
    const channelName = `webrtc-calls-${user.id}-${Date.now()}`;
    
    // Listen for incoming calls
    const callChannel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'active_calls',
        filter: `participants.cs.["${user.id}"]`
      }, async (payload) => {
        console.log('Incoming call detected:', payload);
        
        const newCall = payload.new as ActiveCall;
        
        // Don't show notification for own calls
        if (newCall.caller_id === user.id) return;
        
        // Check if user is in participants list
        const participants = Array.isArray(newCall.participants) ? newCall.participants : [];
        if (!participants.includes(user.id)) return;

        // Fetch caller profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url')
          .eq('id', newCall.caller_id)
          .single();

        if (profile) {
          setCallerProfile(profile);
          setIncomingCall(newCall);
          setShowIncomingCall(true);

          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(`Incoming ${newCall.call_type} call`, {
              body: `${profile.display_name || profile.username} is calling you`,
              icon: profile.avatar_url || '/placeholder.svg'
            });
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'active_calls'
      }, (payload) => {
        const updatedCall = payload.new as ActiveCall;
        
        // If call ended, hide incoming call popup
        if (updatedCall.status === 'ended' && incomingCall?.id === updatedCall.id) {
          setShowIncomingCall(false);
          setIncomingCall(null);
          setCallerProfile(null);
        }
      });

    // Store channel reference
    channelRef.current = callChannel;

    // Subscribe to the channel
    callChannel.subscribe((status) => {
      console.log('WebRTC call channel status:', status);
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      console.log('Cleaning up WebRTC call manager');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, loading, incomingCall?.id]);

  const handleAcceptCall = async () => {
    if (!incomingCall || !user) return;

    try {
      // Update call status and add user to participants
      const { error } = await supabase
        .from('active_calls')
        .update({
          participants: [...(incomingCall.participants || []), user.id]
        })
        .eq('id', incomingCall.id);

      if (error) throw error;

      // Here you would typically initialize WebRTC connection
      console.log('Accepting call:', incomingCall);
      
      setShowIncomingCall(false);
      
      toast({
        title: "Call accepted",
        description: `Connected to ${incomingCall.call_type} call`
      });
    } catch (error) {
      console.error('Error accepting call:', error);
      toast({
        title: "Error",
        description: "Failed to accept call",
        variant: "destructive"
      });
    }
  };

  const handleDeclineCall = async () => {
    if (!incomingCall) return;

    try {
      // End the call
      await supabase
        .from('active_calls')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', incomingCall.id);

      setShowIncomingCall(false);
      setIncomingCall(null);
      setCallerProfile(null);
      
      toast({
        title: "Call declined",
        description: "Call was declined"
      });
    } catch (error) {
      console.error('Error declining call:', error);
    }
  };

  // Don't render anything if auth is loading or user is not available
  if (loading || !user) {
    return null;
  }

  if (!incomingCall || !callerProfile || !showIncomingCall) return null;

  // Render the incoming call popup in a portal to ensure it's above everything
  return createPortal(
    <IncomingCallPopup
      callId={incomingCall.id}
      callerId={incomingCall.caller_id}
      callerName={callerProfile.display_name || callerProfile.username}
      callerAvatar={callerProfile.avatar_url}
      callType={incomingCall.call_type}
      onAccept={handleAcceptCall}
      onDecline={handleDeclineCall}
      isVisible={showIncomingCall}
    />,
    document.body
  );
};

export default WebRTCCallManager;
