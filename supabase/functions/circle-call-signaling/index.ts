import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave' | 'peer-joined' | 'peer-left';
  circleId: string;
  userId: string;
  peerId?: string;
  data?: any;
}

// Store active connections per circle
const circleConnections = new Map<string, Map<string, WebSocket>>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const url = new URL(req.url);
  const circleId = url.searchParams.get('circleId');
  const userId = url.searchParams.get('userId');

  if (!circleId || !userId) {
    return new Response("Missing circleId or userId", { status: 400 });
  }

  console.log(`[Signaling] User ${userId} connecting to circle ${circleId}`);

  const { socket, response } = Deno.upgradeWebSocket(req);

  // Initialize circle connection map if it doesn't exist
  if (!circleConnections.has(circleId)) {
    circleConnections.set(circleId, new Map());
  }

  const circleMap = circleConnections.get(circleId)!;

  socket.onopen = () => {
    console.log(`[Signaling] WebSocket opened for user ${userId} in circle ${circleId}`);
    
    // Add this user to the circle
    circleMap.set(userId, socket);

    // Notify all other peers about the new peer
    const joinMessage: SignalingMessage = {
      type: 'peer-joined',
      circleId,
      userId,
      peerId: userId,
      data: { peerId: userId }
    };

    // Send to all other peers
    circleMap.forEach((peerSocket, peerId) => {
      if (peerId !== userId && peerSocket.readyState === WebSocket.OPEN) {
        try {
          peerSocket.send(JSON.stringify(joinMessage));
          console.log(`[Signaling] Notified peer ${peerId} about new peer ${userId}`);
        } catch (error) {
          console.error(`[Signaling] Error notifying peer ${peerId}:`, error);
        }
      }
    });

    // Send list of existing peers to the new user
    const existingPeers = Array.from(circleMap.keys()).filter(id => id !== userId);
    if (existingPeers.length > 0) {
      socket.send(JSON.stringify({
        type: 'existing-peers',
        circleId,
        userId,
        data: { peers: existingPeers }
      }));
      console.log(`[Signaling] Sent existing peers to ${userId}:`, existingPeers);
    }
  };

  socket.onmessage = (event) => {
    try {
      const message: SignalingMessage = JSON.parse(event.data);
      console.log(`[Signaling] Received message from ${userId}:`, message.type);

      if (message.type === 'offer' || message.type === 'answer' || message.type === 'ice-candidate') {
        // Forward signaling messages to the target peer
        const targetPeerId = message.peerId;
        if (targetPeerId) {
          const targetSocket = circleMap.get(targetPeerId);
          if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
            // Add sender's userId to the message
            const forwardedMessage = {
              ...message,
              peerId: userId // This is who the message is FROM
            };
            targetSocket.send(JSON.stringify(forwardedMessage));
            console.log(`[Signaling] Forwarded ${message.type} from ${userId} to ${targetPeerId}`);
          } else {
            console.log(`[Signaling] Target peer ${targetPeerId} not found or not ready`);
          }
        }
      }
    } catch (error) {
      console.error('[Signaling] Error processing message:', error);
    }
  };

  socket.onclose = () => {
    console.log(`[Signaling] User ${userId} disconnected from circle ${circleId}`);
    
    // Remove user from circle
    circleMap.delete(userId);

    // Notify all other peers about the departure
    const leaveMessage: SignalingMessage = {
      type: 'peer-left',
      circleId,
      userId,
      peerId: userId,
      data: { peerId: userId }
    };

    circleMap.forEach((peerSocket, peerId) => {
      if (peerSocket.readyState === WebSocket.OPEN) {
        try {
          peerSocket.send(JSON.stringify(leaveMessage));
          console.log(`[Signaling] Notified peer ${peerId} about peer ${userId} leaving`);
        } catch (error) {
          console.error(`[Signaling] Error notifying peer ${peerId}:`, error);
        }
      }
    });

    // Clean up empty circles
    if (circleMap.size === 0) {
      circleConnections.delete(circleId);
      console.log(`[Signaling] Cleaned up empty circle ${circleId}`);
    }
  };

  socket.onerror = (error) => {
    console.error(`[Signaling] WebSocket error for user ${userId}:`, error);
  };

  return response;
});
