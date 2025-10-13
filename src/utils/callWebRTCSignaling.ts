import { supabase } from '@/integrations/supabase/client';

export interface CallSignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave' | 'peer-joined' | 'peer-left';
  conversationId: string;
  userId: string;
  peerId?: string;
  data?: any;
}

export class CallWebRTCSignalingClient {
  private ws: WebSocket | null = null;
  private conversationId: string;
  private userId: string;
  private onMessageCallback?: (message: CallSignalingMessage) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(conversationId: string, userId: string) {
    this.conversationId = conversationId;
    this.userId = userId;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `wss://cingbjinmazwnemmmtip.supabase.co/functions/v1/call-signaling?conversationId=${this.conversationId}&userId=${this.userId}`;
        
        console.log('[Call Signaling] Connecting to:', wsUrl);
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[Call Signaling] Connected to signaling server');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: CallSignalingMessage = JSON.parse(event.data);
            console.log('[Call Signaling] Received message:', message.type, message);
            
            if (this.onMessageCallback) {
              this.onMessageCallback(message);
            }
          } catch (error) {
            console.error('[Call Signaling] Error parsing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[Call Signaling] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[Call Signaling] Disconnected from signaling server');
          this.attemptReconnect();
        };
      } catch (error) {
        console.error('[Call Signaling] Connection error:', error);
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`[Call Signaling] Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, delay);
    } else {
      console.error('[Call Signaling] Max reconnection attempts reached');
    }
  }

  sendMessage(message: Omit<CallSignalingMessage, 'conversationId' | 'userId'>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const fullMessage: CallSignalingMessage = {
        ...message,
        conversationId: this.conversationId,
        userId: this.userId,
      };
      
      console.log('[Call Signaling] Sending message:', fullMessage.type, fullMessage);
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.error('[Call Signaling] Cannot send message - WebSocket not ready');
    }
  }

  onMessage(callback: (message: CallSignalingMessage) => void): void {
    this.onMessageCallback = callback;
  }

  disconnect(): void {
    console.log('[Call Signaling] Disconnecting...');
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
