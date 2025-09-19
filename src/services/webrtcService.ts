import { supabase } from '@/integrations/supabase/client';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private signalingChannel: any = null;
  private roomId: string | null = null;
  private userId: string | null = null;

  // Event callbacks
  private onLocalStreamCallback?: (stream: MediaStream) => void;
  private onRemoteStreamCallback?: (stream: MediaStream) => void;
  private onConnectionStateChangeCallback?: (state: RTCPeerConnectionState) => void;
  private onIceConnectionStateChangeCallback?: (state: RTCIceConnectionState) => void;
  private onErrorCallback?: (error: Error) => void;
  private onDataChannelMessageCallback?: (data: any) => void;

  constructor(config?: Partial<WebRTCConfig>) {
    const defaultConfig: WebRTCConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    this.config = { ...defaultConfig, ...config };
  }

  private config: WebRTCConfig;

  // Event handler setters
  onLocalStream(callback: (stream: MediaStream) => void) {
    this.onLocalStreamCallback = callback;
  }

  onRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }

  onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void) {
    this.onConnectionStateChangeCallback = callback;
  }

  onIceConnectionStateChange(callback: (state: RTCIceConnectionState) => void) {
    this.onIceConnectionStateChangeCallback = callback;
  }

  onError(callback: (error: Error) => void) {
    this.onErrorCallback = callback;
  }

  onDataChannelMessage(callback: (data: any) => void) {
    this.onDataChannelMessageCallback = callback;
  }

  async initializeMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
    try {
      console.log('[WebRTCService] Requesting user media with constraints:', constraints);
      
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('[WebRTCService] Successfully obtained local stream');
      
      if (this.onLocalStreamCallback) {
        this.onLocalStreamCallback(this.localStream);
      }

      return this.localStream;
    } catch (error) {
      console.error('[WebRTCService] Failed to get user media:', error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
      
      throw error;
    }
  }

  initializePeerConnection(): void {
    try {
      console.log('[WebRTCService] Creating peer connection with config:', this.config);
      
      this.peerConnection = new RTCPeerConnection(this.config);

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState;
        console.log('[WebRTCService] Connection state changed:', state);
        
        if (this.onConnectionStateChangeCallback && state) {
          this.onConnectionStateChangeCallback(state);
        }
      };

      // Handle ICE connection state changes
      this.peerConnection.oniceconnectionstatechange = () => {
        const state = this.peerConnection?.iceConnectionState;
        console.log('[WebRTCService] ICE connection state changed:', state);
        
        if (this.onIceConnectionStateChangeCallback && state) {
          this.onIceConnectionStateChangeCallback(state);
        }
      };

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        console.log('[WebRTCService] Received remote track:', event);
        
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
          
          if (this.onRemoteStreamCallback) {
            this.onRemoteStreamCallback(this.remoteStream);
          }
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.signalingChannel) {
          console.log('[WebRTCService] Sending ICE candidate');
          
          this.signalingChannel.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: {
              candidate: event.candidate,
              roomId: this.roomId
            }
          });
        }
      };

      // Handle incoming data channel
      this.peerConnection.ondatachannel = (event) => {
        const channel = event.channel;
        console.log('[WebRTCService] Received data channel:', channel.label);
        
        channel.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (this.onDataChannelMessageCallback) {
              this.onDataChannelMessageCallback(data);
            }
          } catch (error) {
            console.error('[WebRTCService] Error parsing data channel message:', error);
          }
        };
      };

      console.log('[WebRTCService] Peer connection initialized successfully');
      
    } catch (error) {
      console.error('[WebRTCService] Failed to initialize peer connection:', error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
      
      throw error;
    }
  }

  async addLocalStream(stream: MediaStream): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      console.log('[WebRTCService] Adding local stream to peer connection');
      
      // Add all tracks from the local stream
      stream.getTracks().forEach(track => {
        if (this.peerConnection && stream) {
          this.peerConnection.addTrack(track, stream);
        }
      });

      // Create data channel for text messaging during calls
      this.dataChannel = this.peerConnection.createDataChannel('messages', {
        ordered: true
      });

      this.dataChannel.onopen = () => {
        console.log('[WebRTCService] Data channel opened');
      };

      this.dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onDataChannelMessageCallback) {
            this.onDataChannelMessageCallback(data);
          }
        } catch (error) {
          console.error('[WebRTCService] Error parsing data channel message:', error);
        }
      };

      console.log('[WebRTCService] Local stream added successfully');
      
    } catch (error) {
      console.error('[WebRTCService] Failed to add local stream:', error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
      
      throw error;
    }
  }

  setupSignaling(roomId: string, userId?: string): void {
    try {
      console.log('[WebRTCService] Setting up signaling for room:', roomId);
      
      this.roomId = roomId;
      this.userId = userId || null;

      // Create unique channel name to avoid conflicts
      const channelName = `webrtc-${roomId}-${Date.now()}`;
      
      this.signalingChannel = supabase.channel(channelName)
        .on('broadcast', { event: 'offer' }, async (payload) => {
          console.log('[WebRTCService] Received offer:', payload);
          await this.handleOffer(payload.payload);
        })
        .on('broadcast', { event: 'answer' }, async (payload) => {
          console.log('[WebRTCService] Received answer:', payload);
          await this.handleAnswer(payload.payload);
        })
        .on('broadcast', { event: 'ice-candidate' }, async (payload) => {
          console.log('[WebRTCService] Received ICE candidate:', payload);
          await this.handleIceCandidate(payload.payload);
        })
        .on('broadcast', { event: 'call-end' }, () => {
          console.log('[WebRTCService] Call ended by remote peer');
          this.cleanup();
        })
        .subscribe();

      console.log('[WebRTCService] Signaling setup completed');
      
    } catch (error) {
      console.error('[WebRTCService] Failed to setup signaling:', error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
    }
  }

  async createOffer(): Promise<void> {
    if (!this.peerConnection || !this.signalingChannel) {
      throw new Error('Peer connection or signaling not initialized');
    }

    try {
      console.log('[WebRTCService] Creating offer');
      
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection.setLocalDescription(offer);

      // Send offer through signaling channel
      this.signalingChannel.send({
        type: 'broadcast',
        event: 'offer',
        payload: {
          offer: offer,
          roomId: this.roomId
        }
      });

      console.log('[WebRTCService] Offer created and sent');
      
    } catch (error) {
      console.error('[WebRTCService] Failed to create offer:', error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
      
      throw error;
    }
  }

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection || !this.signalingChannel) {
      throw new Error('Peer connection or signaling not initialized');
    }

    try {
      console.log('[WebRTCService] Creating answer for offer');
      
      await this.peerConnection.setRemoteDescription(offer);
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // Send answer through signaling channel
      this.signalingChannel.send({
        type: 'broadcast',
        event: 'answer',
        payload: {
          answer: answer,
          roomId: this.roomId
        }
      });

      console.log('[WebRTCService] Answer created and sent');
      
    } catch (error) {
      console.error('[WebRTCService] Failed to create answer:', error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
      
      throw error;
    }
  }

  private async handleOffer(payload: any): Promise<void> {
    if (payload.roomId !== this.roomId) return;
    
    try {
      await this.createAnswer(payload.offer);
    } catch (error) {
      console.error('[WebRTCService] Failed to handle offer:', error);
    }
  }

  private async handleAnswer(payload: any): Promise<void> {
    if (payload.roomId !== this.roomId || !this.peerConnection) return;
    
    try {
      await this.peerConnection.setRemoteDescription(payload.answer);
      console.log('[WebRTCService] Answer handled successfully');
    } catch (error) {
      console.error('[WebRTCService] Failed to handle answer:', error);
    }
  }

  private async handleIceCandidate(payload: any): Promise<void> {
    if (payload.roomId !== this.roomId || !this.peerConnection) return;
    
    try {
      await this.peerConnection.addIceCandidate(payload.candidate);
      console.log('[WebRTCService] ICE candidate added successfully');
    } catch (error) {
      console.error('[WebRTCService] Failed to add ICE candidate:', error);
    }
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      console.log('[WebRTCService] Audio toggled:', enabled);
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      console.log('[WebRTCService] Video toggled:', enabled);
    }
  }

  sendDataChannelMessage(data: any): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(data));
    }
  }

  async switchCamera(): Promise<void> {
    if (!this.localStream) return;

    try {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (!videoTrack) return;

      const constraints = {
        video: {
          facingMode: videoTrack.getSettings().facingMode === 'user' ? 'environment' : 'user'
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      const newVideoTrack = newStream.getVideoTracks()[0];

      // Replace the track in peer connection
      if (this.peerConnection) {
        const sender = this.peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      }

      // Replace track in local stream
      this.localStream.removeTrack(videoTrack);
      this.localStream.addTrack(newVideoTrack);
      
      videoTrack.stop();

      console.log('[WebRTCService] Camera switched successfully');
      
    } catch (error) {
      console.error('[WebRTCService] Failed to switch camera:', error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
    }
  }

  cleanup(): void {
    console.log('[WebRTCService] Cleaning up WebRTC resources');

    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Clear remote stream
    this.remoteStream = null;

    // Clean up signaling channel
    if (this.signalingChannel) {
      try {
        supabase.removeChannel(this.signalingChannel);
      } catch (error) {
        console.error('[WebRTCService] Error removing signaling channel:', error);
      }
      this.signalingChannel = null;
    }

    // Notify about call end
    if (this.onConnectionStateChangeCallback) {
      this.onConnectionStateChangeCallback('closed');
    }

    console.log('[WebRTCService] Cleanup completed');
  }

  // Utility methods
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  getPeerConnection(): RTCPeerConnection | null {
    return this.peerConnection;
  }

  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  getIceConnectionState(): RTCIceConnectionState | null {
    return this.peerConnection?.iceConnectionState || null;
  }
}