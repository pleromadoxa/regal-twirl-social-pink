import { supabase } from '@/integrations/supabase/client';

export interface CallSignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave' | 'peer-joined' | 'peer-left' | 'ping' | 'pong';
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
  private isConnecting = false;
  private reconnectTimeoutId: number | null = null;

  constructor(conversationId: string, userId: string) {
    this.conversationId = conversationId;
    this.userId = userId;
  }

  async connect(): Promise<void> {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('[Call Signaling] Already connecting, skipping duplicate attempt');
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[Call Signaling] Already connected');
      return;
    }

    // Clear any pending reconnect attempts
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        // Use same format as circle-call-signaling
        const wsUrl = `wss://cingbjinmazwnemmmtip.supabase.co/functions/v1/call-signaling?conversationId=${this.conversationId}&userId=${this.userId}`;
        
        console.log('[Call Signaling] Connecting to:', wsUrl);
        this.ws = new WebSocket(wsUrl);

        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            console.error('[Call Signaling] Connection timeout');
            this.ws.close();
            this.isConnecting = false;
            reject(new Error('Connection timeout'));
          }
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('[Call Signaling] Connected to signaling server');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: CallSignalingMessage = JSON.parse(event.data);
            
            // Handle ping messages with pong response
            if (message.type === 'ping') {
              this.sendMessage({ type: 'pong' });
              return;
            }
            
            console.log('[Call Signaling] Received message:', message.type, message);
            
            if (this.onMessageCallback) {
              this.onMessageCallback(message);
            }
          } catch (error) {
            console.error('[Call Signaling] Error parsing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('[Call Signaling] WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log('[Call Signaling] Disconnected from signaling server. Code:', event.code, 'Reason:', event.reason);
          this.isConnecting = false;
          this.attemptReconnect();
        };
      } catch (error) {
        console.error('[Call Signaling] Connection error:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectTimeoutId) {
      return; // Already have a reconnect scheduled
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`[Call Signaling] Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
      
      this.reconnectTimeoutId = setTimeout(() => {
        this.reconnectTimeoutId = null;
        this.connect().catch(console.error);
      }, delay) as unknown as number;
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
    
    // Clear any pending reconnect
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    
    // Reset reconnect attempts
    this.reconnectAttempts = this.maxReconnectAttempts;
    
    if (this.ws) {
      // Remove event handlers before closing
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.onopen = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }
    
    this.isConnecting = false;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
