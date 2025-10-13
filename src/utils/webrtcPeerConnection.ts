export class WebRTCPeerConnection {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private peerId: string;
  private onIceCandidateCallback?: (candidate: RTCIceCandidate) => void;
  private onTrackCallback?: (stream: MediaStream) => void;
  private onConnectionStateChangeCallback?: (state: RTCPeerConnectionState) => void;
  private iceCandidateQueue: RTCIceCandidate[] = [];
  private remoteDescriptionSet = false;

  constructor(peerId: string) {
    this.peerId = peerId;
  }

  async initialize(): Promise<void> {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
      iceCandidatePoolSize: 10,
    };

    console.log(`[WebRTC Peer ${this.peerId}] Initializing peer connection`);
    this.pc = new RTCPeerConnection(configuration);

    // Set up ICE candidate handler with trickle ICE
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[WebRTC Peer ${this.peerId}] New ICE candidate:`, event.candidate.candidate);
        if (this.onIceCandidateCallback) {
          this.onIceCandidateCallback(event.candidate);
        }
      } else {
        console.log(`[WebRTC Peer ${this.peerId}] ICE gathering complete`);
      }
    };

    // Set up track handler
    this.pc.ontrack = (event) => {
      console.log(`[WebRTC Peer ${this.peerId}] Received remote track:`, event.track.kind);
      
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      
      this.remoteStream.addTrack(event.track);
      
      if (this.onTrackCallback) {
        this.onTrackCallback(this.remoteStream);
      }
    };

    // Set up connection state change handler
    this.pc.onconnectionstatechange = () => {
      const state = this.pc?.connectionState;
      console.log(`[WebRTC Peer ${this.peerId}] Connection state changed to:`, state);
      
      if (this.onConnectionStateChangeCallback && state) {
        this.onConnectionStateChangeCallback(state);
      }
    };

    // Set up ICE connection state handler
    this.pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC Peer ${this.peerId}] ICE connection state:`, this.pc?.iceConnectionState);
    };

    // Set up ICE gathering state handler
    this.pc.onicegatheringstatechange = () => {
      console.log(`[WebRTC Peer ${this.peerId}] ICE gathering state:`, this.pc?.iceGatheringState);
    };
  }

  async addLocalStream(stream: MediaStream): Promise<void> {
    if (!this.pc) {
      throw new Error('Peer connection not initialized');
    }

    console.log(`[WebRTC Peer ${this.peerId}] Adding local stream with ${stream.getTracks().length} tracks`);
    this.localStream = stream;

    stream.getTracks().forEach((track) => {
      console.log(`[WebRTC Peer ${this.peerId}] Adding track:`, track.kind, track.label);
      this.pc!.addTrack(track, stream);
    });
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.pc) {
      throw new Error('Peer connection not initialized');
    }

    console.log(`[WebRTC Peer ${this.peerId}] Creating offer`);
    const offer = await this.pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await this.pc.setLocalDescription(offer);
    console.log(`[WebRTC Peer ${this.peerId}] Local description set (offer)`);

    return offer;
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.pc) {
      throw new Error('Peer connection not initialized');
    }

    console.log(`[WebRTC Peer ${this.peerId}] Creating answer`);
    const answer = await this.pc.createAnswer();

    await this.pc.setLocalDescription(answer);
    console.log(`[WebRTC Peer ${this.peerId}] Local description set (answer)`);

    return answer;
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) {
      throw new Error('Peer connection not initialized');
    }

    console.log(`[WebRTC Peer ${this.peerId}] Setting remote description:`, description.type);
    await this.pc.setRemoteDescription(new RTCSessionDescription(description));
    this.remoteDescriptionSet = true;
    
    // Process queued ICE candidates
    console.log(`[WebRTC Peer ${this.peerId}] Processing ${this.iceCandidateQueue.length} queued ICE candidates`);
    while (this.iceCandidateQueue.length > 0) {
      const candidate = this.iceCandidateQueue.shift()!;
      await this.addIceCandidate(candidate);
    }
  }

  async addIceCandidate(candidate: RTCIceCandidate | RTCIceCandidateInit): Promise<void> {
    if (!this.pc) {
      throw new Error('Peer connection not initialized');
    }

    // Queue candidates if remote description is not set yet
    if (!this.remoteDescriptionSet) {
      console.log(`[WebRTC Peer ${this.peerId}] Queueing ICE candidate (remote description not set yet)`);
      this.iceCandidateQueue.push(candidate as RTCIceCandidate);
      return;
    }

    try {
      console.log(`[WebRTC Peer ${this.peerId}] Adding ICE candidate`);
      await this.pc.addIceCandidate(candidate);
    } catch (error) {
      console.error(`[WebRTC Peer ${this.peerId}] Error adding ICE candidate:`, error);
    }
  }

  onIceCandidate(callback: (candidate: RTCIceCandidate) => void): void {
    this.onIceCandidateCallback = callback;
  }

  onTrack(callback: (stream: MediaStream) => void): void {
    this.onTrackCallback = callback;
  }

  onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeCallback = callback;
  }

  getConnectionState(): RTCPeerConnectionState | undefined {
    return this.pc?.connectionState;
  }

  close(): void {
    console.log(`[WebRTC Peer ${this.peerId}] Closing peer connection`);
    
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    this.remoteStream = null;
    this.iceCandidateQueue = [];
    this.remoteDescriptionSet = false;
  }
}
