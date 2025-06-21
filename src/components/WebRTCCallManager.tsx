
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
  const isSubscribedRef = useRef(false);

  // Check if notifications are supported and request permission
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          console.log('Notification permission:', permission);
        }
      } catch (error) {
        console.log('Notification permission request failed:', error);
      }
    }
  };

  // Show browser notification if supported
  const showNotification = (title: string, options: NotificationOptions = {}) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        return new Notification(title, options);
      } catch (error) {
        console.log('Failed to show notification:', error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    if (loading || !user || isSubscribedRef.current) {
      return;
    }

    // Clean up existing channel (if any)
    if (channelRef.current) {
      try { supabase.removeChannel(channelRef.current); } catch {}
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    // We listen for new calls where the user is a participant but not the caller
    const channelName = `webrtc-calls-${user.id}`;

    const callChannel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'active_calls',
        filter: `participants.cs.["${user.id}"]`
      }, async (payload) => {
        const newCall = payload.new as ActiveCall;
        if (newCall.caller_id === user.id) return; // Don't notify own outgoing calls

        // Check if current user is in participants
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

          // Show notification if supported
          showNotification(`Incoming ${newCall.call_type} call`, {
            body: `${profile.display_name || profile.username} is calling you`,
            icon: profile.avatar_url || '/placeholder.svg',
            tag: 'incoming-call'
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'active_calls'
      }, (payload) => {
        const updatedCall = payload.new as ActiveCall;
        if (updatedCall.status === 'ended' && incomingCall?.id === updatedCall.id) {
          setShowIncomingCall(false);
          setIncomingCall(null);
          setCallerProfile(null);
        }
      });

    channelRef.current = callChannel;
    if (!isSubscribedRef.current) {
      callChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') isSubscribedRef.current = true;
      });
    }

    // Request notification permission
    requestNotificationPermission();

    return () => {
      if (channelRef.current && isSubscribedRef.current) {
        try { supabase.removeChannel(channelRef.current); } catch {}
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [user?.id, loading]);

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

  if (loading || !user) return null;
  if (!incomingCall || !callerProfile || !showIncomingCall) return null;

  // Renders the incoming call popup in a portal above the app
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
