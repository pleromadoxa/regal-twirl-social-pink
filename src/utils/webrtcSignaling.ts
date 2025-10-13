import { supabase } from '@/integrations/supabase/client';

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave' | 'peer-joined' | 'peer-left' | 'existing-peers';
  circleId: string;
  userId: string;
  peerId?: string;
  data?: any;
}

export class WebRTCSignalingClient {
  private ws: WebSocket | null = null;
  private circleId: string;
  private userId: string;
  private onMessageCallback?: (message: SignalingMessage) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(circleId: string, userId: string) {
    this.circleId = circleId;
    this.userId = userId;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Use the full WebSocket URL
        const wsUrl = `wss://cingbjinmazwnemmmtip.supabase.co/functions/v1/circle-call-signaling?circleId=${this.circleId}&userId=${this.userId}`;
        
        console.log('[WebRTC Signaling] Connecting to:', wsUrl);
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[WebRTC Signaling] Connected to signaling server');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: SignalingMessage = JSON.parse(event.data);
            console.log('[WebRTC Signaling] Received message:', message.type, message);
            
            if (this.onMessageCallback) {
              this.onMessageCallback(message);
            }
          } catch (error) {
            console.error('[WebRTC Signaling] Error parsing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebRTC Signaling] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WebRTC Signaling] Disconnected from signaling server');
          this.attemptReconnect();
        };
      } catch (error) {
        console.error('[WebRTC Signaling] Connection error:', error);
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`[WebRTC Signaling] Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, delay);
    } else {
      console.error('[WebRTC Signaling] Max reconnection attempts reached');
    }
  }

  sendMessage(message: Omit<SignalingMessage, 'circleId' | 'userId'>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const fullMessage: SignalingMessage = {
        ...message,
        circleId: this.circleId,
        userId: this.userId,
      };
      
      console.log('[WebRTC Signaling] Sending message:', fullMessage.type, fullMessage);
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.error('[WebRTC Signaling] Cannot send message - WebSocket not ready');
    }
  }

  onMessage(callback: (message: SignalingMessage) => void): void {
    this.onMessageCallback = callback;
  }

  disconnect(): void {
    console.log('[WebRTC Signaling] Disconnecting...');
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
