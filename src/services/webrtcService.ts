import { supabase } from '@/integrations/supabase/client';
import { 
  getMobileBrowserInfo, 
  getMobileOptimizedConstraints, 
  requestMobileMediaPermissions,
  createMobileOptimizedPeerConnection,
  handleMobileAudioContext,
  optimizeCallForMobile
} from '@/utils/mobileWebRTC';
import { mediaPermissionManager } from '@/utils/mediaPermissionManager';
import { networkQualityMonitor } from './networkQualityMonitor';
import { connectionResilienceManager } from './connectionResilienceManager';
import { adaptiveQualityManager } from './adaptiveQualityManager';

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
  private signalingRetryCount: number = 0;
  private maxSignalingRetries: number = 3;

  // Event callbacks
  private onLocalStreamCallback?: (stream: MediaStream) => void;
  private onRemoteStreamCallback?: (stream: MediaStream) => void;
  private onConnectionStateChangeCallback?: (state: RTCPeerConnectionState) => void;
  private onIceConnectionStateChangeCallback?: (state: RTCIceConnectionState) => void;
  private onErrorCallback?: (error: Error) => void;
  private onDataChannelMessageCallback?: (data: any) => void;
  private onNetworkQualityCallback?: (quality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected') => void;
  private onReconnectionCallback?: (status: 'attempting' | 'success' | 'failed', attempt?: number) => void;

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

  onNetworkQuality(callback: (quality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected') => void) {
    this.onNetworkQualityCallback = callback;
  }

  onReconnection(callback: (status: 'attempting' | 'success' | 'failed', attempt?: number) => void) {
    this.onReconnectionCallback = callback;
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
      
      // Use mobile-optimized peer connection with enhanced configuration
      this.peerConnection = createMobileOptimizedPeerConnection(this.config.iceServers);

      // Set up all event handlers
      this.setupPeerConnectionHandlers();

      // Initialize enhanced call management services
      this.initializeCallManagement();

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
      console.log('[WebRTCService] Setting up signaling for room:', roomId, 'user:', userId);
      
      // Cleanup existing channel
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

      // Create the channel name based on the room ID
      const channelName = `webrtc-signaling-${roomId}`;
      
      console.log('[WebRTCService] Creating signaling channel:', channelName);
      
      // Configure channel for WebRTC signaling
      this.signalingChannel = supabase.channel(channelName)
        .on('broadcast', { event: 'offer' }, async (payload) => {
          console.log('[WebRTCService] Received offer:', payload);
          try {
            if (payload.payload?.roomId === this.roomId) {
              await this.handleOffer(payload.payload);
            }
          } catch (error) {
            console.error('[WebRTCService] Error handling offer:', error);
          }
        })
        .on('broadcast', { event: 'answer' }, async (payload) => {
          console.log('[WebRTCService] Received answer:', payload);
          try {
            if (payload.payload?.roomId === this.roomId) {
              await this.handleAnswer(payload.payload);
            }
          } catch (error) {
            console.error('[WebRTCService] Error handling answer:', error);
          }
        })
        .on('broadcast', { event: 'ice-candidate' }, async (payload) => {
          console.log('[WebRTCService] Received ICE candidate:', payload);
          try {
            if (payload.payload?.roomId === this.roomId) {
              await this.handleIceCandidate(payload.payload);
            }
          } catch (error) {
            console.error('[WebRTCService] Error handling ICE candidate:', error);
          }
        })
        .on('broadcast', { event: 'participant-joined' }, (payload) => {
          console.log('[WebRTCService] Participant joined:', payload);
        })
        .on('broadcast', { event: 'participant-left' }, (payload) => {
          console.log('[WebRTCService] Participant left:', payload);
        })
        .on('broadcast', { event: 'call-end' }, (payload) => {
          console.log('[WebRTCService] Call ended by remote peer');
          if (payload.payload?.roomId === this.roomId) {
            this.cleanup();
          }
        })
        .subscribe(async (status) => {
          console.log('[WebRTCService] Signaling channel status:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('[WebRTCService] ✅ Signaling channel connected successfully');
            this.signalingRetryCount = 0;
            
            // Announce presence
            this.signalingChannel?.send({
              type: 'broadcast',
              event: 'participant-joined',
              payload: {
                userId: this.userId,
                roomId: this.roomId,
                timestamp: Date.now()
              }
            });
          } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            console.error('[WebRTCService] ❌ Signaling channel error:', status);
            
            if (this.signalingRetryCount < this.maxSignalingRetries) {
              this.signalingRetryCount++;
              const retryDelay = Math.min(1000 * Math.pow(2, this.signalingRetryCount), 8000);
              console.log(`[WebRTCService] Retrying in ${retryDelay}ms`);
              
              setTimeout(() => {
                this.setupSignaling(roomId, userId);
              }, retryDelay);
            } else {
              if (this.onErrorCallback) {
                this.onErrorCallback(new Error('Failed to establish signaling connection'));
              }
            }
          }
        });

      console.log('[WebRTCService] Signaling setup complete');
      
    } catch (error) {
      console.error('[WebRTCService] Failed to setup signaling:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
    }
  }

  private testSignalingConnection(): void {
    if (this.signalingChannel) {
      console.log('[WebRTCService] Testing signaling connection for room:', this.roomId);
      try {
        const testPayload = { 
          timestamp: Date.now(), 
          roomId: this.roomId,
          testId: Math.random().toString(36).substr(2, 9)
        };
        
        this.signalingChannel.send({
          type: 'broadcast',
          event: 'connection-test',
          payload: testPayload
        });
        
        console.log('[WebRTCService] Sent connection test:', testPayload);
      } catch (error) {
        console.error('[WebRTCService] Failed to send connection test:', error);
      }
    } else {
      console.error('[WebRTCService] No signaling channel available for test');
    }
  }

  async createOffer(): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      console.log('[WebRTCService] Creating offer...');
      
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      console.log('[WebRTCService] Offer created:', offer);

      await this.peerConnection.setLocalDescription(offer);
      console.log('[WebRTCService] Local description set');

      // Send offer through signaling
      if (this.signalingChannel && this.roomId) {
        console.log('[WebRTCService] Sending offer through signaling');
        
        await this.signalingChannel.send({
          type: 'broadcast',
          event: 'offer',
          payload: {
            offer: offer,
            roomId: this.roomId,
            senderId: this.userId,
            timestamp: Date.now()
          }
        });
        
        console.log('[WebRTCService] Offer sent successfully');
      } else {
        console.error('[WebRTCService] Cannot send offer - no signaling channel or room ID');
      }
    } catch (error) {
      console.error('[WebRTCService] Error creating offer:', error);
      throw error;
    }
  }

  private async handleOffer(payload: any): Promise<void> {
    if (!this.peerConnection) {
      console.error('[WebRTCService] No peer connection available to handle offer');
      return;
    }

    try {
      console.log('[WebRTCService] Handling offer from:', payload.senderId);
      
      // Ignore our own offers
      if (payload.senderId === this.userId) {
        console.log('[WebRTCService] Ignoring own offer');
        return;
      }

      const offer = new RTCSessionDescription(payload.offer);
      
      // Set remote description
      await this.peerConnection.setRemoteDescription(offer);
      console.log('[WebRTCService] Remote description set from offer');

      // Process queued ICE candidates
      await this.processQueuedIceCandidates();

      // Create answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      console.log('[WebRTCService] Answer created and local description set');

      // Send answer through signaling
      if (this.signalingChannel) {
        await this.signalingChannel.send({
          type: 'broadcast',
          event: 'answer',
          payload: {
            answer: answer,
            roomId: this.roomId,
            senderId: this.userId,
            targetUserId: payload.senderId,
            timestamp: Date.now()
          }
        });
        
        console.log('[WebRTCService] Answer sent to:', payload.senderId);
      }
    } catch (error) {
      console.error('[WebRTCService] Error handling offer:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
    }
  }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = async (event) => {
      if (event.candidate && this.signalingChannel) {
        console.log('[WebRTCService] Sending ICE candidate');
        
        try {
          const sendResult = await this.signalingChannel.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: {
              candidate: event.candidate,
              roomId: this.roomId,
              senderId: this.userId,
              timestamp: Date.now()
            }
          });
          
          console.log('[WebRTCService] ICE candidate sent, result:', sendResult);
        } catch (error) {
          console.error('[WebRTCService] Failed to send ICE candidate:', error);
        }
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
    
    // Reset retry counter
    this.signalingRetryCount = 0;

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

    // Use media permission manager to properly cleanup streams
    if (this.localStream) {
      mediaPermissionManager.cleanupStream(this.localStream);
      this.localStream = null;
    }

    // Clear remote stream
    this.remoteStream = null;
    
    // Clear queued ICE candidates
    this.queuedIceCandidates = [];

    // Clean up signaling channel
    if (this.signalingChannel) {
      try {
        this.signalingChannel.unsubscribe();
        supabase.removeChannel(this.signalingChannel);
      } catch (error) {
        console.error('[WebRTCService] Error removing signaling channel:', error);
      }
      this.signalingChannel = null;
    }

    // Reset identifiers
    this.roomId = null;
    this.userId = null;

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

  private initializeCallManagement(): void {
    if (!this.peerConnection) return;

    try {
      console.log('[WebRTCService] Initializing enhanced call management');

      // Initialize network quality monitoring
      networkQualityMonitor.startMonitoring(this.peerConnection);
      networkQualityMonitor.onQualityUpdate((metrics) => {
        if (this.onNetworkQualityCallback) {
          this.onNetworkQualityCallback(metrics.overall);
        }
      });

      // Initialize connection resilience
      connectionResilienceManager.initialize(this.peerConnection);
      connectionResilienceManager.onReconnectionAttempt((attempt, maxAttempts) => {
        console.log(`[WebRTCService] Reconnection attempt ${attempt}/${maxAttempts}`);
        if (this.onReconnectionCallback) {
          this.onReconnectionCallback('attempting', attempt);
        }
      });

      connectionResilienceManager.onReconnectionSuccess(() => {
        console.log('[WebRTCService] Reconnection successful');
        if (this.onReconnectionCallback) {
          this.onReconnectionCallback('success');
        }
      });

      connectionResilienceManager.onReconnectionFailed(() => {
        console.log('[WebRTCService] Reconnection failed');
        if (this.onReconnectionCallback) {
          this.onReconnectionCallback('failed');
        }
      });

      // Initialize adaptive quality management
      const callType = this.localStream?.getVideoTracks().length ? 'video' : 'audio';
      adaptiveQualityManager.initialize(this.peerConnection, callType);

      console.log('[WebRTCService] Enhanced call management initialized');
    } catch (error) {
      console.error('[WebRTCService] Failed to initialize call management:', error);
    }
  }

  private enhancedCleanup(): void {
    console.log('[WebRTCService] Performing enhanced cleanup');
    
    try {
      networkQualityMonitor.stopMonitoring();
      connectionResilienceManager.cleanup();
      adaptiveQualityManager.cleanup();
      
      console.log('[WebRTCService] Enhanced cleanup completed');
    } catch (error) {
      console.error('[WebRTCService] Error during enhanced cleanup:', error);
    }
  }

  async forceReconnection(): Promise<void> {
    console.log('[WebRTCService] Forcing connection recovery');
    
    try {
      if (this.peerConnection && this.peerConnection.restartIce) {
        this.peerConnection.restartIce();
      }
      
      connectionResilienceManager.forceReconnect();
      adaptiveQualityManager.setQualityProfile('low');
      
    } catch (error) {
      console.error('[WebRTCService] Error during forced reconnection:', error);
      throw error;
    }
  }
}