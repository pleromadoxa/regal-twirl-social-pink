
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createCall, joinCall, endCall, subscribeToCallUpdates, ActiveCall } from '@/services/callService';
import { WebRTCService } from '@/services/webrtcService';
import { useToast } from '@/hooks/use-toast';

interface CallConnectionProps {
  conversationId: string;
  otherUserId: string;
  callType: 'audio' | 'video';
  onCallEnd?: () => void;
  onCallStart?: () => void;
}

const CallConnection = ({ 
  conversationId, 
  otherUserId, 
  callType, 
  onCallEnd, 
  onCallStart 
}: CallConnectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [webrtcService, setWebrtcService] = useState<WebRTCService | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!user || !conversationId || !otherUserId) return;

    let unsubscribe: (() => void) | null = null;

    const initializeCall = async () => {
      try {
        setIsConnecting(true);
        
        // Create call record
        const call = await createCall(user.id, callType, [user.id, otherUserId]);
        setActiveCall(call);

        // Initialize WebRTC service
        const service = new WebRTCService();
        setWebrtcService(service);

        // Set up WebRTC event handlers
        service.onError((error) => {
          console.error('[CallConnection] WebRTC error:', error);
          toast({
            title: "Call Error",
            description: error.message,
            variant: "destructive"
          });
        });

        service.onConnectionStateChange((state) => {
          console.log('[CallConnection] Connection state:', state);
          if (state === 'connected') {
            setIsConnecting(false);
            if (onCallStart) onCallStart();
          } else if (state === 'failed' || state === 'closed') {
            handleCallEnd();
          }
        });

        // Initialize media and peer connection
        const mediaConstraints = {
          video: callType === 'video',
          audio: true
        };

        await service.initializeMedia(mediaConstraints);
        service.initializePeerConnection();
        
        if (service.localStream) {
          await service.addLocalStream(service.localStream);
        }

        // Setup signaling
        const channelName = `${callType}-call-${conversationId}-${Date.now()}`;
        service.setupSignaling(channelName);

        // Start call process (create offer)
        await service.createOffer();

        // Subscribe to call updates
        unsubscribe = subscribeToCallUpdates(
          call.id,
          (updatedCall) => {
            setActiveCall(updatedCall);
            if (updatedCall.status === 'ended') {
              handleCallEnd();
            }
          },
          (error) => {
            console.error('[CallConnection] Call update error:', error);
          }
        );

      } catch (error) {
        console.error('[CallConnection] Error initializing call:', error);
        setIsConnecting(false);
        toast({
          title: "Failed to start call",
          description: "Please try again later",
          variant: "destructive"
        });
      }
    };

    initializeCall();

    return () => {
      if (unsubscribe) unsubscribe();
      if (webrtcService) {
        webrtcService.cleanup();
      }
    };
  }, [user, conversationId, otherUserId, callType]);

  const handleCallEnd = async () => {
    try {
      if (activeCall) {
        await endCall(activeCall.id);
      }
      
      if (webrtcService) {
        webrtcService.cleanup();
        setWebrtcService(null);
      }
      
      setActiveCall(null);
      setIsConnecting(false);
      
      if (onCallEnd) onCallEnd();
    } catch (error) {
      console.error('[CallConnection] Error ending call:', error);
    }
  };

  return null; // This is a service component, no UI
};

export default CallConnection;
