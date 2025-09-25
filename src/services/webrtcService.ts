import { supabase } from '@/integrations/supabase/client';
import { 
  getMobileBrowserInfo, 
  getMobileOptimizedConstraints, 
  requestMobileMediaPermissions,
  createMobileOptimizedPeerConnection,
  handleMobileAudioContext,
  optimizeCallForMobile
} from '@/utils/mobileWebRTC';

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
  private queuedIceCandidates: RTCIceCandidateInit[] = [];

  // Event callbacks
  private onLocalStreamCallback?: (stream: MediaStream) => void;
  private onRemoteStreamCallback?: (stream: MediaStream) => void;
  private onConnectionStateChangeCallback?: (state: RTCPeerConnectionState) => void;
  private onIceConnectionStateChangeCallback?: (state: RTCIceConnectionState) => void;
  private onErrorCallback?: (error: Error) => void;
  private onDataChannelMessageCallback?: (data: any) => void;

  constructor(config?: Partial<WebRTCConfig>) {
    const browserInfo = getMobileBrowserInfo();
    
    // Mobile-optimized default configuration with TURN servers for NAT traversal
    const defaultConfig: WebRTCConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        // Free TURN servers for better connectivity through firewalls/NAT
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
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
      
      // Check if we already have a local stream to avoid multiple permission requests
      if (this.localStream && this.localStream.active) {
        console.log('[WebRTCService] Reusing existing local stream');
        return this.localStream;
      }
      
      const browserInfo = getMobileBrowserInfo();
      
      // Check permission state first to avoid unnecessary requests
      if (navigator.permissions) {
        try {
          const audioPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (constraints.video) {
            const videoPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
            if (audioPermission.state === 'denied' || videoPermission.state === 'denied') {
              throw new Error('Camera or microphone access has been denied. Please enable permissions in your browser settings and refresh the page.');
            }
          } else if (audioPermission.state === 'denied') {
            throw new Error('Microphone access has been denied. Please enable permissions in your browser settings and refresh the page.');
          }
        } catch (permError) {
          console.log('[WebRTCService] Permission API not available or failed:', permError);
          // Continue with getUserMedia if permissions API is not available
        }
      }
      
      // Use mobile-optimized constraints if on mobile
      const optimizedConstraints = browserInfo.isMobile 
        ? getMobileOptimizedConstraints(constraints.video ? 'video' : 'audio', browserInfo)
        : constraints;
      
      console.log('[WebRTCService] Using optimized constraints:', optimizedConstraints);
      
      // Initialize mobile audio context if needed
      if (browserInfo.isMobile && constraints.audio) {
        await handleMobileAudioContext();
      }
      
      // Use mobile-optimized media request
      this.localStream = await requestMobileMediaPermissions(optimizedConstraints);
      
      console.log('[WebRTCService] Successfully obtained local stream');
      
      if (this.onLocalStreamCallback) {
        this.onLocalStreamCallback(this.localStream);
      }

      return this.localStream;
    } catch (error) {
      console.error('[WebRTCService] Failed to get user media:', error);
      
      // Enhanced mobile error handling
      const browserInfo = getMobileBrowserInfo();
      if (browserInfo.isMobile && error instanceof Error) {
        let enhancedError = error;
        
        if (error.name === 'NotAllowedError') {
          enhancedError = new Error(`Permission denied: Please allow ${constraints.video ? 'camera and microphone' : 'microphone'} access when prompted by your browser. On ${browserInfo.isIOS ? 'iOS Safari' : 'Android'}, check Settings > Safari/Chrome > Camera & Microphone permissions.`);
        } else if (error.name === 'NotFoundError') {
          enhancedError = new Error('No camera or microphone found. Please ensure your device has the required hardware and try again.');
        } else if (error.name === 'NotReadableError') {
          enhancedError = new Error('Camera or microphone is already in use by another application. Please close other apps and try again.');
        } else if (error.name === 'OverconstrainedError') {
          enhancedError = new Error('Camera or microphone does not support the required settings. Trying with reduced quality...');
        }
        
        if (this.onErrorCallback) {
          this.onErrorCallback(enhancedError);
        }
        
        throw enhancedError;
      }
      
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
      
      throw error;
    }
  }

  initializePeerConnection(): void {
    try {
      console.log('[WebRTCService] Creating peer connection with config:', this.config);
      
      // Use mobile-optimized peer connection
      this.peerConnection = createMobileOptimizedPeerConnection(this.config.iceServers);

      // Set up all event handlers
      this.setupPeerConnectionHandlers();

      console.log('[WebRTCService] Peer connection initialized successfully');
      
    } catch (error) {
      console.error('[WebRTCService] Failed to initialize peer connection:', error);
      
      // Try with basic configuration if enhanced config fails
      if (!this.peerConnection) {
        try {
          console.log('[WebRTCService] Retrying with basic configuration...');
          this.peerConnection = new RTCPeerConnection({
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' }
            ]
          });
          this.setupPeerConnectionHandlers();
        } catch (fallbackError) {
          console.error('[WebRTCService] Fallback initialization also failed:', fallbackError);
          if (this.onErrorCallback) {
            this.onErrorCallback(fallbackError as Error);
          }
          throw fallbackError;
        }
      }
      
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

      // Apply mobile optimizations
      const browserInfo = getMobileBrowserInfo();
      if (browserInfo.isMobile && this.peerConnection) {
        const callType = stream.getVideoTracks().length > 0 ? 'video' : 'audio';
        optimizeCallForMobile(this.peerConnection, callType);
      }

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
      
      // Cleanup existing channel to avoid subscription conflicts
      if (this.signalingChannel) {
        console.log('[WebRTCService] Cleaning up existing signaling channel');
        try {
          supabase.removeChannel(this.signalingChannel);
        } catch (cleanupError) {
          console.error('[WebRTCService] Error cleaning up signaling channel:', cleanupError);
        }
        this.signalingChannel = null;
      }
      
      this.roomId = roomId;
      this.userId = userId || null;

      // Create unique channel name to avoid conflicts
      const channelName = `webrtc-${roomId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('[WebRTCService] Creating signaling channel:', channelName);
      
      this.signalingChannel = supabase.channel(channelName)
        .on('broadcast', { event: 'offer' }, async (payload) => {
          console.log('[WebRTCService] Received offer:', payload);
          try {
            await this.handleOffer(payload.payload);
          } catch (error) {
            console.error('[WebRTCService] Error handling offer:', error);
          }
        })
        .on('broadcast', { event: 'answer' }, async (payload) => {
          console.log('[WebRTCService] Received answer:', payload);
          try {
            await this.handleAnswer(payload.payload);
          } catch (error) {
            console.error('[WebRTCService] Error handling answer:', error);
          }
        })
        .on('broadcast', { event: 'ice-candidate' }, async (payload) => {
          console.log('[WebRTCService] Received ICE candidate:', payload);
          try {
            // Only handle ICE candidates if we have a remote description
            if (this.peerConnection?.remoteDescription) {
              await this.handleIceCandidate(payload.payload);
            } else {
              // Queue the candidate for later processing
              this.queuedIceCandidates.push(payload.payload.candidate);
              console.log('[WebRTCService] Queued ICE candidate (no remote description yet)');
            }
          } catch (error) {
            console.error('[WebRTCService] Error handling ICE candidate:', error);
          }
        })
        .on('broadcast', { event: 'call-end' }, () => {
          console.log('[WebRTCService] Call ended by remote peer');
          this.cleanup();
        })
        .on('broadcast', { event: 'connection-test' }, (payload) => {
          console.log('[WebRTCService] Connection test received:', payload);
          // Send test response
          if (this.signalingChannel) {
            this.signalingChannel.send({
              type: 'broadcast',
              event: 'connection-test-response',
              payload: { timestamp: Date.now(), roomId: this.roomId }
            });
          }
        })
        .on('broadcast', { event: 'connection-test-response' }, (payload) => {
          console.log('[WebRTCService] Connection test response:', payload);
        })
        .subscribe((status) => {
          console.log('[WebRTCService] Signaling channel status:', status);
        });

      // Test signaling connection
      setTimeout(() => {
        this.testSignalingConnection();
      }, 1000);

      console.log('[WebRTCService] Signaling setup completed');
      
    } catch (error) {
      console.error('[WebRTCService] Failed to setup signaling:', error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
    }
  }

  private testSignalingConnection(): void {
    if (this.signalingChannel) {
      console.log('[WebRTCService] Testing signaling connection');
      this.signalingChannel.send({
        type: 'broadcast',
        event: 'connection-test',
        payload: { timestamp: Date.now(), roomId: this.roomId }
      });
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
      
      // Process queued ICE candidates
      await this.processQueuedIceCandidates();
    } catch (error) {
      console.error('[WebRTCService] Failed to handle offer:', error);
    }
  }

  private async handleAnswer(payload: any): Promise<void> {
    if (payload.roomId !== this.roomId || !this.peerConnection) return;
    
    try {
      await this.peerConnection.setRemoteDescription(payload.answer);
      console.log('[WebRTCService] Answer handled successfully');
      
      // Process queued ICE candidates
      await this.processQueuedIceCandidates();
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

  private async handleConnectionFailure(): Promise<void> {
    try {
      if (!this.peerConnection || !this.signalingChannel) return;

      console.log('[WebRTCService] Attempting to recover connection...');
      
      // Create new offer with ICE restart
      const offer = await this.peerConnection.createOffer({
        iceRestart: true,
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection.setLocalDescription(offer);

      // Send recovery offer
      this.signalingChannel.send({
        type: 'broadcast',
        event: 'offer',
        payload: {
          offer: offer,
          roomId: this.roomId,
          recovery: true
        }
      });

      console.log('[WebRTCService] Recovery offer sent');
    } catch (error) {
      console.error('[WebRTCService] Connection recovery failed:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error('Connection lost and recovery failed'));
      }
    }
  }

  private setupPeerConnectionHandlers(): void {
    if (!this.peerConnection) return;

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('[WebRTCService] Connection state changed:', state);
      
      if (this.onConnectionStateChangeCallback && state) {
        this.onConnectionStateChangeCallback(state);
      }
    };

    // Handle ICE connection state changes with retry logic
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      console.log('[WebRTCService] ICE connection state changed:', state);
      
      // Handle connection failures with retry
      if (state === 'failed' || state === 'disconnected') {
        console.log('[WebRTCService] Connection failed, attempting ICE restart...');
        this.handleConnectionFailure();
      }
      
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
  }

  async switchCamera(): Promise<void> {
    if (!this.localStream) return;

    try {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (!videoTrack) return;

      const browserInfo = getMobileBrowserInfo();
      const currentFacingMode = videoTrack.getSettings().facingMode;
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      // Mobile-optimized camera switch constraints
      const constraints = getMobileOptimizedConstraints('video', browserInfo);
      if (constraints.video && typeof constraints.video === 'object') {
        (constraints.video as MediaTrackConstraints).facingMode = newFacingMode;
      }

      const newStream = await requestMobileMediaPermissions(constraints);
      const newVideoTrack = newStream.getVideoTracks()[0];

      if (!newVideoTrack) {
        throw new Error('Failed to get new video track');
      }

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

      // Update local stream callback
      if (this.onLocalStreamCallback) {
        this.onLocalStreamCallback(this.localStream);
      }

      console.log('[WebRTCService] Camera switched successfully to:', newFacingMode);
      
    } catch (error) {
      console.error('[WebRTCService] Failed to switch camera:', error);
      
      // Enhanced mobile error handling for camera switch
      const browserInfo = getMobileBrowserInfo();
      if (browserInfo.isMobile && error instanceof Error) {
        let enhancedError = error;
        
        if (error.name === 'OverconstrainedError') {
          enhancedError = new Error('Camera switch not supported on this device. Try using the default camera.');
        } else if (error.name === 'NotFoundError') {
          enhancedError = new Error('No alternative camera found on this device.');
        }
        
        if (this.onErrorCallback) {
          this.onErrorCallback(enhancedError);
        }
        
        throw enhancedError;
      }
      
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
    }
  }

  private async processQueuedIceCandidates() {
    console.log(`[WebRTCService] Processing ${this.queuedIceCandidates.length} queued ICE candidates`);
    
    for (const candidate of this.queuedIceCandidates) {
      try {
        if (this.peerConnection) {
          await this.peerConnection.addIceCandidate(candidate);
          console.log('[WebRTCService] Processed queued ICE candidate successfully');
        }
      } catch (error) {
        console.error('[WebRTCService] Failed to process queued ICE candidate:', error);
      }
    }
    
    this.queuedIceCandidates = [];
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
    
    // Clear queued ICE candidates
    this.queuedIceCandidates = [];

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