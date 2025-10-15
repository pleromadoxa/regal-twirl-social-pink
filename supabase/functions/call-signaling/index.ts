import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave' | 'ping' | 'pong';
  conversationId: string;
  userId: string;
  peerId?: string;
  data?: any;
}

// Store active WebSocket connections per conversation
const conversationConnections = new Map<string, Map<string, WebSocket>>();
const heartbeatIntervals = new Map<string, number>();

// Heartbeat to keep connections alive
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

const startHeartbeat = (socketId: string, socket: WebSocket) => {
  const intervalId = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'ping' }));
    } else {
      clearInterval(intervalId);
      heartbeatIntervals.delete(socketId);
    }
  }, HEARTBEAT_INTERVAL);
  
  heartbeatIntervals.set(socketId, intervalId);
};

const stopHeartbeat = (socketId: string) => {
  const intervalId = heartbeatIntervals.get(socketId);
  if (intervalId) {
    clearInterval(intervalId);
    heartbeatIntervals.delete(socketId);
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket", { 
      status: 426,
      headers: corsHeaders 
    });
  }

  const url = new URL(req.url);
  const conversationId = url.searchParams.get("conversationId");
  const userId = url.searchParams.get("userId");

  if (!conversationId || !userId) {
    return new Response("Missing conversationId or userId", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onopen = () => {
      console.log(`[Signaling] User ${userId} connected to conversation ${conversationId}`);
      
      // Initialize conversation map if it doesn't exist
      if (!conversationConnections.has(conversationId)) {
        conversationConnections.set(conversationId, new Map());
      }
      
      const conversationUsers = conversationConnections.get(conversationId)!;
      conversationUsers.set(userId, socket);
      
      // Start heartbeat for this connection
      const socketId = `${conversationId}-${userId}`;
      startHeartbeat(socketId, socket);

      // Notify about existing peer
      const existingPeers = Array.from(conversationUsers.keys()).filter(id => id !== userId);
      if (existingPeers.length > 0) {
        socket.send(JSON.stringify({
          type: 'peer-joined',
          conversationId,
          userId: existingPeers[0],
          peerId: existingPeers[0]
        }));
      }

      // Notify other user about new peer
      conversationUsers.forEach((ws, otherUserId) => {
        if (otherUserId !== userId && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'peer-joined',
            conversationId,
            userId,
            peerId: userId
          }));
        }
      });
    };

    socket.onmessage = (event) => {
      try {
        const message: SignalingMessage = JSON.parse(event.data);
        
        // Handle pong responses
        if (message.type === 'pong') {
          return;
        }
        
        console.log(`[Signaling] Message from ${userId}:`, message.type);

        const conversationUsers = conversationConnections.get(conversationId);
        if (!conversationUsers) return;

        // Forward signaling messages to the other peer
        if (message.type === 'offer' || message.type === 'answer' || message.type === 'ice-candidate') {
          conversationUsers.forEach((ws, otherUserId) => {
            if (otherUserId !== userId && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                ...message,
                peerId: userId
              }));
            }
          });
        }
      } catch (error) {
        console.error('[Signaling] Error processing message:', error);
      }
    };

    socket.onclose = () => {
      console.log(`[Signaling] User ${userId} disconnected from conversation ${conversationId}`);
      
      // Stop heartbeat for this connection
      const socketId = `${conversationId}-${userId}`;
      stopHeartbeat(socketId);
      
      const conversationUsers = conversationConnections.get(conversationId);
      if (conversationUsers) {
        conversationUsers.delete(userId);

        // Notify other user about peer leaving
        conversationUsers.forEach((ws, otherUserId) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'peer-left',
              conversationId,
              userId,
              peerId: userId
            }));
          }
        });

        // Clean up empty conversations
        if (conversationUsers.size === 0) {
          conversationConnections.delete(conversationId);
        }
      }
    };

    socket.onerror = (error) => {
      console.error('[Signaling] WebSocket error for user', userId, ':', error);
    };

    return response;
  } catch (error) {
    console.error('[Signaling] Error upgrading to WebSocket:', error);
    return new Response("WebSocket upgrade failed", { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
