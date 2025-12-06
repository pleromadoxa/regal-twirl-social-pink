import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade, connection, sec-websocket-key, sec-websocket-version, sec-websocket-protocol',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Store active streams and their connections
const streams = new Map<string, {
  broadcaster: WebSocket | null;
  viewers: Map<string, WebSocket>;
  offer?: string;
  iceCandidates: string[];
}>();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const upgrade = req.headers.get("upgrade") || "";
  
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 426, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const streamId = url.searchParams.get('streamId');
  const role = url.searchParams.get('role'); // 'broadcaster' or 'viewer'
  const viewerId = url.searchParams.get('viewerId') || crypto.randomUUID();

  if (!streamId || !role) {
    return new Response("Missing streamId or role", { status: 400, headers: corsHeaders });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  // Initialize stream if not exists
  if (!streams.has(streamId)) {
    streams.set(streamId, {
      broadcaster: null,
      viewers: new Map(),
      iceCandidates: []
    });
  }

  const stream = streams.get(streamId)!;

  socket.onopen = () => {
    console.log(`[Live Stream] ${role} connected to stream ${streamId}`);
    
    if (role === 'broadcaster') {
      stream.broadcaster = socket;
      // Clear previous offer/candidates for new broadcast
      stream.offer = undefined;
      stream.iceCandidates = [];
      
      // Notify all viewers that broadcaster is ready
      stream.viewers.forEach((viewer) => {
        viewer.send(JSON.stringify({ type: 'broadcaster-ready' }));
      });
    } else {
      stream.viewers.set(viewerId, socket);
      
      // Send existing offer to new viewer if available
      if (stream.offer) {
        socket.send(JSON.stringify({
          type: 'offer',
          data: stream.offer
        }));
        
        // Send existing ICE candidates
        stream.iceCandidates.forEach(candidate => {
          socket.send(JSON.stringify({
            type: 'ice-candidate',
            data: candidate
          }));
        });
      } else if (stream.broadcaster) {
        // Request new offer from broadcaster for this viewer
        stream.broadcaster.send(JSON.stringify({
          type: 'viewer-joined',
          viewerId
        }));
      }
    }
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log(`[Live Stream] ${role} message:`, message.type);

      if (role === 'broadcaster') {
        switch (message.type) {
          case 'offer':
            // Store offer and broadcast to all viewers
            stream.offer = message.data;
            stream.iceCandidates = []; // Reset candidates for new offer
            stream.viewers.forEach((viewer) => {
              viewer.send(JSON.stringify({
                type: 'offer',
                data: message.data
              }));
            });
            break;
            
          case 'ice-candidate':
            // Store and broadcast ICE candidate
            stream.iceCandidates.push(message.data);
            stream.viewers.forEach((viewer) => {
              viewer.send(JSON.stringify({
                type: 'ice-candidate',
                data: message.data
              }));
            });
            break;
            
          case 'chat':
            // Broadcast chat to all viewers
            stream.viewers.forEach((viewer) => {
              viewer.send(JSON.stringify({
                type: 'chat',
                data: message.data
              }));
            });
            break;
        }
      } else {
        // Viewer messages
        switch (message.type) {
          case 'answer':
            // Forward answer to broadcaster
            if (stream.broadcaster) {
              stream.broadcaster.send(JSON.stringify({
                type: 'answer',
                viewerId,
                data: message.data
              }));
            }
            break;
            
          case 'ice-candidate':
            // Forward ICE candidate to broadcaster
            if (stream.broadcaster) {
              stream.broadcaster.send(JSON.stringify({
                type: 'viewer-ice-candidate',
                viewerId,
                data: message.data
              }));
            }
            break;
            
          case 'chat':
            // Broadcast chat from viewer to broadcaster and all viewers
            if (stream.broadcaster) {
              stream.broadcaster.send(JSON.stringify({
                type: 'chat',
                data: message.data
              }));
            }
            stream.viewers.forEach((viewer) => {
              viewer.send(JSON.stringify({
                type: 'chat',
                data: message.data
              }));
            });
            break;
        }
      }
    } catch (error) {
      console.error('[Live Stream] Error processing message:', error);
    }
  };

  socket.onclose = () => {
    console.log(`[Live Stream] ${role} disconnected from stream ${streamId}`);
    
    if (role === 'broadcaster') {
      stream.broadcaster = null;
      // Notify all viewers that stream ended
      stream.viewers.forEach((viewer) => {
        viewer.send(JSON.stringify({ type: 'stream-ended' }));
      });
      // Clean up stream after broadcaster leaves
      setTimeout(() => {
        if (!stream.broadcaster) {
          streams.delete(streamId);
        }
      }, 5000);
    } else {
      stream.viewers.delete(viewerId);
      // Notify broadcaster of viewer count
      if (stream.broadcaster) {
        stream.broadcaster.send(JSON.stringify({
          type: 'viewer-left',
          viewerId,
          viewerCount: stream.viewers.size
        }));
      }
    }
  };

  socket.onerror = (error) => {
    console.error(`[Live Stream] ${role} WebSocket error:`, error);
  };

  return response;
});
