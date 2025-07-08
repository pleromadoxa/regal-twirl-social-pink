import { supabase } from '@/integrations/supabase/client';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize?: number;
}

export interface MediaConstraints {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private signalingChannel: any = null;
  private isInitiator: boolean = false;
  private currentUserId: string | null = null;
  
  private readonly config: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
  };

  private onLocalStreamCallback?: (stream: MediaStream) => void;
  private onRemoteStreamCallback?: (stream: MediaStream) => void;
  private onConnectionStateChangeCallback?: (state: RTCPeerConnectionState) => void;
  private onIceConnectionStateChangeCallback?: (state: RTCIceConnectionState) => void;
  private onErrorCallback?: (error: Error) => void;

  constructor() {
    console.log('[WebRTC] Service initialized');
    this.getCurrentUserId();
  }

  private async getCurrentUserId(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      this.currentUserId = user?.id || null;
    } catch (error) {
      console.error('[WebRTC] Error getting current user:', error);
    }
  }

  async initializeMedia(constraints: MediaConstraints): Promise<MediaStream> {
    return Promise.reject(new Error('WebRTC functionality is disabled'));
  }

  initializePeerConnection(): RTCPeerConnection {
    console.log('[WebRTC] Initializing peer connection with config:', this.config);
    
    this.peerConnection = new RTCPeerConnection(this.config);
    
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('[WebRTC] Connection state changed:', state);
      
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback(state!);
      }
      
      if (state === 'failed' || state === 'disconnected') {
        console.error('[WebRTC] Connection failed or disconnected, attempting to restart');
        this.handleConnectionFailure();
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      console.log('[WebRTC] ICE connection state changed:', state);
      
      if (this.onIceConnectionStateChangeCallback) {
        this.onIceConnectionStateChangeCallback(state!);
      }
      
      if (state === 'failed') {
        console.error('[WebRTC] ICE connection failed, restarting ICE');
        this.restartIce();
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] New ICE candidate:', {
          type: event.candidate.type,
          protocol: event.candidate.protocol,
          address: event.candidate.address
        });
        
        if (this.signalingChannel) {
          this.signalingChannel.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: {
              candidate: event.candidate,
              from: this.getUserId()
            }
          });
        }
      } else {
        console.log('[WebRTC] ICE candidate gathering completed');
      }
    };

    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Received remote track:', {
        kind: event.track.kind,
        streams: event.streams.length,
        trackId: event.track.id
      });
      
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        
        this.remoteStream.getTracks().forEach((track, index) => {
          console.log(`[WebRTC] Remote track ${index}:`, {
            kind: track.kind,
            enabled: track.enabled,
            readyState: track.readyState
          });
        });
        
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(this.remoteStream);
        }
      }
    };

    this.peerConnection.ondatachannel = (event) => {
      console.log('[WebRTC] Data channel received:', event.channel.label);
    };

    return this.peerConnection;
  }

  async addLocalStream(stream: MediaStream): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    console.log('[WebRTC] Adding local stream tracks to peer connection');
    
    const senders = this.peerConnection.getSenders();
    for (const sender of senders) {
      if (sender.track) {
        console.log('[WebRTC] Removing existing track:', sender.track.kind);
        this.peerConnection.removeTrack(sender);
      }
    }

    for (const track of stream.getTracks()) {
      console.log('[WebRTC] Adding track:', {
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState
      });
      
      const sender = this.peerConnection.addTrack(track, stream);
      console.log('[WebRTC] Track added successfully, sender:', sender);
    }

    const updatedSenders = this.peerConnection.getSenders();
    console.log('[WebRTC] Total senders after adding tracks:', updatedSenders.length);
  }

  setupSignaling(channelName: string): any {
    console.log('[WebRTC] Setting up signaling channel:', channelName);
    
    this.signalingChannel = supabase.channel(channelName);
    
    this.signalingChannel
      .on('broadcast', { event: 'offer' }, this.handleOffer.bind(this))
      .on('broadcast', { event: 'answer' }, this.handleAnswer.bind(this))
      .on('broadcast', { event: 'ice-candidate' }, this.handleIceCandidate.bind(this))
      .on('broadcast', { event: 'call-end' }, this.handleCallEnd.bind(this));

    this.signalingChannel.subscribe((status: string) => {
      console.log('[WebRTC] Signaling channel status:', status);
    });

    return this.signalingChannel;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    console.log('[WebRTC] Creating offer');
    this.isInitiator = true;
    
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    
    await this.peerConnection.setLocalDescription(offer);
    console.log('[WebRTC] Local description set (offer):', offer.type);
    
    if (this.signalingChannel) {
      this.signalingChannel.send({
        type: 'broadcast',
        event: 'offer',
        payload: {
          offer,
          from: this.getUserId()
        }
      });
    }
    
    return offer;
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    console.log('[WebRTC] Creating answer');
    
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    console.log('[WebRTC] Local description set (answer):', answer.type);
    
    return answer;
  }

  private async handleOffer(payload: any): Promise<void> {
    const { offer, from } = payload.payload;
    
    if (from === this.getUserId()) return;
    
    console.log('[WebRTC] Received offer from:', from);
    
    try {
      if (!this.peerConnection) {
        this.initializePeerConnection();
      }
      
      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('[WebRTC] Remote description set (offer)');
      
      const answer = await this.createAnswer();
      
      this.signalingChannel.send({
        type: 'broadcast',
        event: 'answer',
        payload: {
          answer,
          from: this.getUserId(),
          to: from
        }
      });
    } catch (error) {
      console.error('[WebRTC] Error handling offer:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
    }
  }

  private async handleAnswer(payload: any): Promise<void> {
    const { answer, from } = payload.payload;
    
    if (from === this.getUserId()) return;
    
    console.log('[WebRTC] Received answer from:', from);
    
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('[WebRTC] Remote description set (answer)');
      }
    } catch (error) {
      console.error('[WebRTC] Error handling answer:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error as Error);
      }
    }
  }

  private async handleIceCandidate(payload: any): Promise<void> {
    const { candidate, from } = payload.payload;
    
    if (from === this.getUserId()) return;
    
    console.log('[WebRTC] Received ICE candidate from:', from);
    
    try {
      if (this.peerConnection && this.peerConnection.remoteDescription) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('[WebRTC] ICE candidate added successfully');
      } else {
        console.warn('[WebRTC] Cannot add ICE candidate - no remote description');
      }
    } catch (error) {
      console.error('[WebRTC] Error adding ICE candidate:', error);
    }
  }

  private handleCallEnd(payload: any): void {
    const { from } = payload.payload;
    if (from !== this.getUserId()) {
      console.log('[WebRTC] Call ended by remote peer');
      this.cleanup();
    }
  }

  private async restartIce(): Promise<void> {
    if (!this.peerConnection || !this.isInitiator) return;
    
    console.log('[WebRTC] Restarting ICE connection');
    
    try {
      const offer = await this.peerConnection.createOffer({ iceRestart: true });
      await this.peerConnection.setLocalDescription(offer);
      
      this.signalingChannel.send({
        type: 'broadcast',
        event: 'offer',
        payload: {
          offer,
          from: this.getUserId()
        }
      });
    } catch (error) {
      console.error('[WebRTC] Error restarting ICE:', error);
    }
  }

  private handleConnectionFailure(): void {
    console.log('[WebRTC] Handling connection failure');
    
    this.restartIce();
    
    setTimeout(() => {
      if (this.peerConnection?.connectionState === 'failed') {
        console.error('[WebRTC] Connection recovery failed');
        if (this.onErrorCallback) {
          this.onErrorCallback(new Error('Connection failed and could not be recovered'));
        }
      }
    }, 10000);
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = enabled;
        console.log('[WebRTC] Audio track enabled:', enabled);
      });
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = enabled;
        console.log('[WebRTC] Video track enabled:', enabled);
      });
    }
  }

  cleanup(): void {
    console.log('[WebRTC] Cleaning up resources');
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
        console.log('[WebRTC] Stopped local track:', track.kind);
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
  }

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

  private getUserId(): string {
    return this.currentUserId || 'unknown-user';
  }

  get connectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  get iceConnectionState(): RTCIceConnectionState | null {
    return this.peerConnection?.iceConnectionState || null;
  }
}
