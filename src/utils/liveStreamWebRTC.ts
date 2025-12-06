export interface StreamMessage {
  type: string;
  data?: any;
  viewerId?: string;
  viewerCount?: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export class LiveStreamBroadcaster {
  private ws: WebSocket | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private streamId: string;
  private onViewerCountChange?: (count: number) => void;
  private onChatMessage?: (message: ChatMessage) => void;

  constructor(
    streamId: string,
    options?: {
      onViewerCountChange?: (count: number) => void;
      onChatMessage?: (message: ChatMessage) => void;
    }
  ) {
    this.streamId = streamId;
    this.onViewerCountChange = options?.onViewerCountChange;
    this.onChatMessage = options?.onChatMessage;
  }

  async start(stream: MediaStream): Promise<void> {
    this.localStream = stream;
    
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `wss://cingbjinmazwnemmmtip.supabase.co/functions/v1/live-stream-signaling?streamId=${this.streamId}&role=broadcaster`;
        console.log('[Broadcaster] Connecting to signaling server:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = async () => {
          console.log('[Broadcaster] Connected to signaling server');
          // Create initial offer for any waiting viewers
          await this.createAndSendOffer();
          resolve();
        };

        this.ws.onmessage = async (event) => {
          const message: StreamMessage = JSON.parse(event.data);
          console.log('[Broadcaster] Received:', message.type);
          await this.handleMessage(message);
        };

        this.ws.onerror = (error) => {
          console.error('[Broadcaster] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[Broadcaster] Disconnected from signaling server');
        };
      } catch (error) {
        console.error('[Broadcaster] Connection error:', error);
        reject(error);
      }
    });
  }

  private async createAndSendOffer(): Promise<void> {
    if (!this.localStream || !this.ws) return;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    
    // Add all tracks from local stream
    this.localStream.getTracks().forEach(track => {
      pc.addTrack(track, this.localStream!);
    });

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.ws) {
        this.ws.send(JSON.stringify({
          type: 'ice-candidate',
          data: JSON.stringify(event.candidate)
        }));
      }
    };

    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    this.ws.send(JSON.stringify({
      type: 'offer',
      data: JSON.stringify(offer)
    }));

    // Store the peer connection
    this.peerConnections.set('broadcast', pc);
  }

  private async handleMessage(message: StreamMessage): Promise<void> {
    switch (message.type) {
      case 'viewer-joined':
        console.log('[Broadcaster] Viewer joined:', message.viewerId);
        // Recreate offer if needed
        await this.createAndSendOffer();
        break;

      case 'answer':
        if (message.data) {
          const pc = this.peerConnections.get('broadcast');
          if (pc && pc.signalingState === 'have-local-offer') {
            const answer = JSON.parse(message.data);
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('[Broadcaster] Answer set for viewer:', message.viewerId);
          }
        }
        break;

      case 'viewer-ice-candidate':
        if (message.data) {
          const pc = this.peerConnections.get('broadcast');
          if (pc) {
            const candidate = JSON.parse(message.data);
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }
        break;

      case 'viewer-left':
        if (this.onViewerCountChange && message.viewerCount !== undefined) {
          this.onViewerCountChange(message.viewerCount);
        }
        break;

      case 'chat':
        if (this.onChatMessage && message.data) {
          this.onChatMessage(message.data);
        }
        break;
    }
  }

  updateStream(stream: MediaStream): void {
    this.localStream = stream;
    
    // Update tracks in all peer connections
    this.peerConnections.forEach(pc => {
      const senders = pc.getSenders();
      stream.getTracks().forEach(track => {
        const sender = senders.find(s => s.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track);
        }
      });
    });
  }

  sendChat(message: ChatMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'chat',
        data: message
      }));
    }
  }

  stop(): void {
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.localStream = null;
  }
}

export class LiveStreamViewer {
  private ws: WebSocket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private streamId: string;
  private viewerId: string;
  private onStream?: (stream: MediaStream) => void;
  private onStreamEnded?: () => void;
  private onChatMessage?: (message: ChatMessage) => void;
  private onConnectionStateChange?: (state: string) => void;

  constructor(
    streamId: string,
    options?: {
      onStream?: (stream: MediaStream) => void;
      onStreamEnded?: () => void;
      onChatMessage?: (message: ChatMessage) => void;
      onConnectionStateChange?: (state: string) => void;
    }
  ) {
    this.streamId = streamId;
    this.viewerId = crypto.randomUUID();
    this.onStream = options?.onStream;
    this.onStreamEnded = options?.onStreamEnded;
    this.onChatMessage = options?.onChatMessage;
    this.onConnectionStateChange = options?.onConnectionStateChange;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `wss://cingbjinmazwnemmmtip.supabase.co/functions/v1/live-stream-signaling?streamId=${this.streamId}&role=viewer&viewerId=${this.viewerId}`;
        console.log('[Viewer] Connecting to signaling server:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[Viewer] Connected to signaling server');
          resolve();
        };

        this.ws.onmessage = async (event) => {
          const message: StreamMessage = JSON.parse(event.data);
          console.log('[Viewer] Received:', message.type);
          await this.handleMessage(message);
        };

        this.ws.onerror = (error) => {
          console.error('[Viewer] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[Viewer] Disconnected from signaling server');
        };
      } catch (error) {
        console.error('[Viewer] Connection error:', error);
        reject(error);
      }
    });
  }

  private async handleMessage(message: StreamMessage): Promise<void> {
    switch (message.type) {
      case 'broadcaster-ready':
        console.log('[Viewer] Broadcaster is ready');
        break;

      case 'offer':
        if (message.data) {
          await this.handleOffer(JSON.parse(message.data));
        }
        break;

      case 'ice-candidate':
        if (message.data && this.peerConnection) {
          const candidate = JSON.parse(message.data);
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
        break;

      case 'stream-ended':
        console.log('[Viewer] Stream ended');
        if (this.onStreamEnded) {
          this.onStreamEnded();
        }
        break;

      case 'chat':
        if (this.onChatMessage && message.data) {
          this.onChatMessage(message.data);
        }
        break;
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    // Close existing connection if any
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Handle incoming stream
    this.peerConnection.ontrack = (event) => {
      console.log('[Viewer] Received track:', event.track.kind);
      if (event.streams[0] && this.onStream) {
        this.onStream(event.streams[0]);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.ws) {
        this.ws.send(JSON.stringify({
          type: 'ice-candidate',
          data: JSON.stringify(event.candidate)
        }));
      }
    };

    // Monitor connection state
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState || 'unknown';
      console.log('[Viewer] Connection state:', state);
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(state);
      }
    };

    // Set remote description and create answer
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    // Send answer to broadcaster
    if (this.ws) {
      this.ws.send(JSON.stringify({
        type: 'answer',
        data: JSON.stringify(answer)
      }));
    }
  }

  sendChat(message: ChatMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'chat',
        data: message
      }));
    }
  }

  disconnect(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
