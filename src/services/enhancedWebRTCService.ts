
import { supabase } from '@/integrations/supabase/client';

export interface MediaPermissions {
  camera: boolean;
  microphone: boolean;
  screen?: boolean;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize?: number;
}

export interface CallSession {
  id: string;
  roomId: string;
  participants: string[];
  callType: 'audio' | 'video';
  isInitiator: boolean;
}

export class EnhancedWebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private signalingChannel: any = null;
  private callSession: CallSession | null = null;
  private isInitiator: boolean = false;
  
  private readonly config: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      // Add TURN servers for better connectivity
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ],
    iceCandidatePoolSize: 10
  };

  // Event callbacks
  private onLocalStreamCallback?: (stream: MediaStream) => void;
  private onRemoteStreamCallback?: (stream: MediaStream) => void;
  private onConnectionStateChangeCallback?: (state: RTCPeerConnectionState) => void;
  private onIceConnectionStateChangeCallback?: (state: RTCIceConnectionState) => void;
  private onErrorCallback?: (error: Error) => void;
  private onCallEndCallback?: () => void;

  constructor() {
    console.log('[EnhancedWebRTC] Service initialized');
  }

  // Check device capabilities and permissions
  async checkMediaPermissions(): Promise<MediaPermissions> {
    const permissions: MediaPermissions = {
      camera: false,
      microphone: false,
      screen: false
    };

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC is not supported on this device');
      }

      // For mobile devices, we need to handle permissions differently
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        console.log('[EnhancedWebRTC] Mobile device detected, checking permissions carefully');
      }

      // Try to access microphone
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        permissions.microphone = true;
        audioStream.getTracks().forEach(track => track.stop());
        console.log('[EnhancedWebRTC] Microphone permission granted');
      } catch (error) {
        console.warn('[EnhancedWebRTC] Microphone permission denied:', error);
      }

      // Try to access camera
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        permissions.camera = true;
        videoStream.getTracks().forEach(track => track.stop());
        console.log('[EnhancedWebRTC] Camera permission granted');
      } catch (error) {
        console.warn('[EnhancedWebRTC] Camera permission denied:', error);
      }

      // Check screen sharing support (not available on mobile)
      if (!isMobile && navigator.mediaDevices.getDisplayMedia) {
        permissions.screen = true;
        console.log('[EnhancedWebRTC] Screen sharing supported');
      }

    } catch (error) {
      console.error('[EnhancedWebRTC] Error checking permissions:', error);
    }

    return permissions;
  }

  // Request permissions with user-friendly prompts
  async requestMediaPermissions(audio: boolean = true, video: boolean = true): Promise<MediaStream> {
    try {
      console.log('[EnhancedWebRTC] Requesting media permissions:', { audio, video });

      // Enhanced constraints for better quality and mobile compatibility
      const constraints: MediaStreamConstraints = {
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 48000 },
          channelCount: { ideal: 1 }
        } : false,
        video: video ? {
          width: { ideal: 1280, max: 1920, min: 640 },
          height: { ideal: 720, max: 1080, min: 480 },
          frameRate: { ideal: 30, max: 60, min: 15 },
          facingMode: { ideal: 'user' }, // Front camera on mobile
          aspectRatio: { ideal: 16/9 }
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('[EnhancedWebRTC] Media stream obtained:', {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length
      });

      // Log track capabilities for debugging
      stream.getTracks().forEach((track, index) => {
        console.log(`[EnhancedWebRTC] Track ${index}:`, {
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
          settings: track.getSettings(),
          constraints: track.getConstraints()
        });
      });

      return stream;
    } catch (error) {
      console.error('[EnhancedWebRTC] Error requesting media permissions:', error);
      
      // Provide specific error messages
      let errorMessage = 'Failed to access camera/microphone';
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = 'Camera/microphone access denied. Please allow permissions in your browser settings.';
            break;
          case 'NotFoundError':
            errorMessage = 'No camera or microphone found. Please connect a device and try again.';
            break;
          case 'NotReadableError':
            errorMessage = 'Camera/microphone is being used by another application. Please close other apps and try again.';
            break;
          case 'OverconstrainedError':
            errorMessage = 'Camera/microphone settings not supported. Trying with basic settings...';
            // Fallback to basic constraints
            try {
              return await navigator.mediaDevices.getUserMedia({
                audio: audio,
                video: video ? { width: 640, height: 480 } : false
              });
            } catch (fallbackError) {
              errorMessage = 'Failed to access camera/microphone even with basic settings.';
            }
            break;
          case 'AbortError':
            errorMessage = 'Media access was cancelled.';
            break;
          case 'NotSupportedError':
            errorMessage = 'WebRTC is not supported on this device/browser.';
            break;
          case 'SecurityError':
            errorMessage = 'Media access blocked for security reasons. Please use HTTPS.';
            break;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  // Initialize peer connection with enhanced settings
  initializePeerConnection(): RTCPeerConnection {
    console.log('[EnhancedWebRTC] Initializing peer connection');
    
    this.peerConnection = new RTCPeerConnection(this.config);
    
    // Connection state monitoring
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('[EnhancedWebRTC] Connection state:', state);
      
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback(state!);
      }
      
      // Handle connection failures
      if (state === 'failed' || state === 'disconnected') {
        console.error('[EnhancedWebRTC] Connection failed, attempting restart');
        this.handleConnectionFailure();
      } else if (state === 'closed') {
        this.cleanup();
      }
    };

    // ICE connection state monitoring
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      console.log('[EnhancedWebRTC] ICE connection state:', state);
      
      if (this.onIceConnectionStateChangeCallback) {
        this.onIceConnectionStateChangeCallback(state!);
      }
      
      if (state === 'failed') {
        console.error('[EnhancedWebRTC] ICE connection failed, restarting ICE');
        this.restartIce();
      }
    };

    // ICE candidate handling
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[EnhancedWebRTC] New ICE candidate:', {
          type: event.candidate.type,
          protocol: event.candidate.protocol,
          address: event.candidate.address,
          port: event.candidate.port
        });
        
        this.sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate
        });
      } else {
        console.log('[EnhancedWebRTC] ICE candidate gathering completed');
      }
    };

    // Remote stream handling
    this.peerConnection.ontrack = (event) => {
      console.log('[EnhancedWebRTC] Received remote track:', {
        kind: event.track.kind,
        streams: event.streams.length,
        trackId: event.track.id
      });
      
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        
        // Log remote stream details
        this.remoteStream.getTracks().forEach((track, index) => {
          console.log(`[EnhancedWebRTC] Remote track ${index}:`, {
            kind: track.kind,
            enabled: track.enabled,
            readyState: track.readyState,
            settings: track.getSettings()
          });
        });
        
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(this.remoteStream);
        }
      }
    };

    return this.peerConnection;
  }

  // Setup signaling channel
  setupSignaling(roomId: string, userId: string): void {
    console.log('[EnhancedWebRTC] Setting up signaling for room:', roomId);
    
    this.signalingChannel = supabase.channel(`webrtc-${roomId}`);
    
    this.signalingChannel
      .on('broadcast', { event: 'webrtc-signal' }, (payload: any) => {
        this.handleSignalingMessage(payload.payload, userId);
      })
      .on('broadcast', { event: 'call-end' }, (payload: any) => {
        if (payload.payload.from !== userId) {
          console.log('[EnhancedWebRTC] Call ended by remote peer');
          this.handleCallEnd();
        }
      })
      .subscribe((status: string) => {
        console.log('[EnhancedWebRTC] Signaling channel status:', status);
      });
  }

  // Send signaling messages
  private sendSignalingMessage(message: any): void {
    if (this.signalingChannel) {
      this.signalingChannel.send({
        type: 'broadcast',
        event: 'webrtc-signal',
        payload: {
          ...message,
          from: this.getCurrentUserId(),
          timestamp: Date.now()
        }
      });
    }
  }

  // Handle incoming signaling messages
  private async handleSignalingMessage(message: any, currentUserId: string): Promise<void> {
    if (message.from === currentUserId) return;
    
    console.log('[EnhancedWebRTC] Received signaling message:', message.type);
    
    try {
      switch (message.type) {
        case 'offer':
          await this.handleOffer(message.offer);
          break;
        case 'answer':
          await this.handleAnswer(message.answer);
          break;
        case 'ice-candidate':
          await this.handleIceCandidate(message.candidate);
          break;
        default:
          console.warn('[EnhancedWebRTC] Unknown signaling message type:', message.type);
      }
    } catch (error) {
      console.error('[EnhancedWebRTC] Error handling signaling message:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
    }
  }

  // Create and send offer
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    console.log('[EnhancedWebRTC] Creating offer');
    this.isInitiator = true;
    
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    
    await this.peerConnection.setLocalDescription(offer);
    console.log('[EnhancedWebRTC] Local description set (offer)');
    
    this.sendSignalingMessage({
      type: 'offer',
      offer: offer
    });
    
    return offer;
  }

  // Handle incoming offer
  private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      this.initializePeerConnection();
    }
    
    console.log('[EnhancedWebRTC] Handling offer');
    
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    
    this.sendSignalingMessage({
      type: 'answer',
      answer: answer
    });
    
    console.log('[EnhancedWebRTC] Answer sent');
  }

  // Handle incoming answer
  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) return;
    
    console.log('[EnhancedWebRTC] Handling answer');
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  // Handle ICE candidates
  private async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) {
      console.warn('[EnhancedWebRTC] Cannot add ICE candidate - no remote description');
      return;
    }
    
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('[EnhancedWebRTC] ICE candidate added successfully');
    } catch (error) {
      console.error('[EnhancedWebRTC] Error adding ICE candidate:', error);
    }
  }

  // Add local stream to peer connection
  async addLocalStream(stream: MediaStream): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    console.log('[EnhancedWebRTC] Adding local stream to peer connection');
    this.localStream = stream;
    
    // Remove existing tracks
    const senders = this.peerConnection.getSenders();
    for (const sender of senders) {
      if (sender.track) {
        this.peerConnection.removeTrack(sender);
      }
    }

    // Add new tracks
    for (const track of stream.getTracks()) {
      console.log('[EnhancedWebRTC] Adding track:', track.kind);
      this.peerConnection.addTrack(track, stream);
    }

    if (this.onLocalStreamCallback) {
      this.onLocalStreamCallback(stream);
    }
  }

  // Media control methods
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = enabled;
        console.log('[EnhancedWebRTC] Audio track enabled:', enabled);
      });
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = enabled;
        console.log('[EnhancedWebRTC] Video track enabled:', enabled);
      });
    }
  }

  // Switch camera (front/back on mobile)
  async switchCamera(): Promise<void> {
    if (!this.localStream) return;

    try {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (!videoTrack) return;

      const currentFacingMode = videoTrack.getSettings().facingMode;
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      console.log('[EnhancedWebRTC] Switching camera from', currentFacingMode, 'to', newFacingMode);

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: true
      });

      // Replace video track
      const newVideoTrack = newStream.getVideoTracks()[0];
      const sender = this.peerConnection?.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );

      if (sender && newVideoTrack) {
        await sender.replaceTrack(newVideoTrack);
        
        // Stop old track and update local stream
        videoTrack.stop();
        this.localStream.removeTrack(videoTrack);
        this.localStream.addTrack(newVideoTrack);

        if (this.onLocalStreamCallback) {
          this.onLocalStreamCallback(this.localStream);
        }
      }
    } catch (error) {
      console.error('[EnhancedWebRTC] Error switching camera:', error);
    }
  }

  // Connection recovery methods
  private async restartIce(): Promise<void> {
    if (!this.peerConnection || !this.isInitiator) return;
    
    console.log('[EnhancedWebRTC] Restarting ICE connection');
    
    try {
      const offer = await this.peerConnection.createOffer({ iceRestart: true });
      await this.peerConnection.setLocalDescription(offer);
      
      this.sendSignalingMessage({
        type: 'offer',
        offer: offer
      });
    } catch (error) {
      console.error('[EnhancedWebRTC] Error restarting ICE:', error);
    }
  }

  private handleConnectionFailure(): void {
    console.log('[EnhancedWebRTC] Handling connection failure');
    
    // Attempt to restart ICE first
    this.restartIce();
    
    // If still failing after timeout, notify error
    setTimeout(() => {
      if (this.peerConnection?.connectionState === 'failed') {
        console.error('[EnhancedWebRTC] Connection recovery failed');
        if (this.onErrorCallback) {
          this.onErrorCallback(new Error('Connection failed and could not be recovered'));
        }
      }
    }, 10000);
  }

  // Handle call end
  private handleCallEnd(): void {
    console.log('[EnhancedWebRTC] Handling call end');
    this.cleanup();
    if (this.onCallEndCallback) {
      this.onCallEndCallback();
    }
  }

  // End call
  endCall(): void {
    console.log('[EnhancedWebRTC] Ending call');
    
    // Notify other participants
    if (this.signalingChannel) {
      this.signalingChannel.send({
        type: 'broadcast',
        event: 'call-end',
        payload: {
          from: this.getCurrentUserId(),
          timestamp: Date.now()
        }
      });
    }
    
    this.handleCallEnd();
  }

  // Cleanup resources
  cleanup(): void {
    console.log('[EnhancedWebRTC] Cleaning up resources');
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
        console.log('[EnhancedWebRTC] Stopped local track:', track.kind);
      });
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.signalingChannel) {
      supabase.removeChannel(this.signalingChannel);
      this.signalingChannel = null;
    }

    this.remoteStream = null;
    this.callSession = null;
  }

  // Event handler setters
  onLocalStream(callback: (stream: MediaStream) => void): void {
    this.onLocalStreamCallback = callback;
  }

  onRemoteStream(callback: (stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback;
  }

  onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeCallback = callback;
  }

  onIceConnectionStateChange(callback: (state: RTCIceConnectionState) => void): void {
    this.onIceConnectionStateChangeCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  onCallEnd(callback: () => void): void {
    this.onCallEndCallback = callback;
  }

  // Utility methods
  private getCurrentUserId(): string {
    // This should return the current user's ID from your auth system
    return 'current-user-id'; // Replace with actual implementation
  }

  // Getters
  get connectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  get iceConnectionState(): RTCIceConnectionState | null {
    return this.peerConnection?.iceConnectionState || null;
  }

  get hasLocalStream(): boolean {
    return this.localStream !== null;
  }

  get hasRemoteStream(): boolean {
    return this.remoteStream !== null;
  }
}
