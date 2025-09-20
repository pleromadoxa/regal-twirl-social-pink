/**
 * Mobile WebRTC utility functions for enhanced browser compatibility
 */

export interface MobileBrowserInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isMobile: boolean;
  version: number;
  supportsWebRTC: boolean;
}

export const getMobileBrowserInfo = (): MobileBrowserInfo => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isChrome = /chrome/.test(userAgent);
  const isFirefox = /firefox/.test(userAgent);
  const isMobile = /mobile|android|iphone|ipad|ipod/.test(userAgent);

  // Extract version numbers
  let version = 0;
  if (isChrome) {
    const match = userAgent.match(/chrome\/(\d+)/);
    version = match ? parseInt(match[1]) : 0;
  } else if (isSafari) {
    const match = userAgent.match(/version\/(\d+)/);
    version = match ? parseInt(match[1]) : 0;
  } else if (isFirefox) {
    const match = userAgent.match(/firefox\/(\d+)/);
    version = match ? parseInt(match[1]) : 0;
  }

  const supportsWebRTC = !!(
    typeof RTCPeerConnection !== 'undefined' ||
    typeof webkitRTCPeerConnection !== 'undefined' ||
    typeof mozRTCPeerConnection !== 'undefined'
  );

  return {
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    isFirefox,
    isMobile,
    version,
    supportsWebRTC
  };
};

export const getMobileOptimizedConstraints = (callType: 'audio' | 'video', browserInfo?: MobileBrowserInfo): MediaStreamConstraints => {
  const info = browserInfo || getMobileBrowserInfo();
  
  const baseConstraints: MediaStreamConstraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      // Mobile-optimized audio settings
      sampleRate: info.isMobile ? 16000 : 48000,
      channelCount: 1,
    },
    video: callType === 'video'
  };

  if (callType === 'video') {
    // Mobile-optimized video constraints
    baseConstraints.video = {
      width: info.isMobile ? { ideal: 640, max: 1280 } : { ideal: 1280 },
      height: info.isMobile ? { ideal: 480, max: 720 } : { ideal: 720 },
      frameRate: info.isMobile ? { ideal: 15, max: 30 } : { ideal: 30 },
      facingMode: info.isMobile ? 'user' : undefined,
    };

    // iOS Safari specific video settings
    if (info.isIOS && info.isSafari) {
      (baseConstraints.video as MediaTrackConstraints).width = { ideal: 480, max: 640 };
      (baseConstraints.video as MediaTrackConstraints).height = { ideal: 360, max: 480 };
      (baseConstraints.video as MediaTrackConstraints).frameRate = { ideal: 15, max: 24 };
    }

    // Android Chrome optimizations
    if (info.isAndroid && info.isChrome) {
      (baseConstraints.video as MediaTrackConstraints).width = { ideal: 640, max: 1280 };
      (baseConstraints.video as MediaTrackConstraints).height = { ideal: 480, max: 720 };
    }
  }

  return baseConstraints;
};

export const requestMobileMediaPermissions = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
  const browserInfo = getMobileBrowserInfo();
  
  try {
    // First attempt with modern API
    if (navigator.mediaDevices?.getUserMedia) {
      return await navigator.mediaDevices.getUserMedia(constraints);
    }
    
    // Fallback for older mobile browsers
    const getUserMedia = 
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    if (getUserMedia) {
      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }

    throw new Error('getUserMedia not supported on this device');
    
  } catch (error) {
    console.error('Error requesting media permissions:', error);
    
    // Mobile-specific error handling
    if (browserInfo.isMobile) {
      // Try with reduced constraints on mobile
      const fallbackConstraints = {
        audio: constraints.audio ? {
          echoCancellation: true,
          noiseSuppression: true,
        } : false,
        video: constraints.video ? {
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 15 }
        } : false
      };

      try {
        if (navigator.mediaDevices?.getUserMedia) {
          return await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        }
      } catch (fallbackError) {
        console.error('Fallback media request also failed:', fallbackError);
      }
    }
    
    throw error;
  }
};

export const createMobileOptimizedPeerConnection = (iceServers?: RTCIceServer[]): RTCPeerConnection => {
  const browserInfo = getMobileBrowserInfo();
  
  // Mobile-optimized ICE servers
  const mobileIceServers = iceServers || [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Additional STUN servers for better mobile connectivity
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ];

  const configuration: RTCConfiguration = {
    iceServers: mobileIceServers,
    // Mobile-optimized peer connection settings
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
  };

  // iOS Safari specific optimizations - removed deprecated sdpSemantics
  // Modern browsers use unified-plan by default

  // Create peer connection with browser-specific constructor
  let peerConnection: RTCPeerConnection;
  
  if (typeof RTCPeerConnection !== 'undefined') {
    peerConnection = new RTCPeerConnection(configuration);
  } else if (typeof webkitRTCPeerConnection !== 'undefined') {
    peerConnection = new webkitRTCPeerConnection(configuration);
  } else if (typeof mozRTCPeerConnection !== 'undefined') {
    peerConnection = new mozRTCPeerConnection(configuration);
  } else {
    throw new Error('RTCPeerConnection not supported on this device');
  }

  // Mobile-specific peer connection optimizations
  if (browserInfo.isMobile) {
    // Add mobile-specific event handlers for better connection stability
    peerConnection.addEventListener('iceconnectionstatechange', () => {
      const state = peerConnection.iceConnectionState;
      console.log('[MobileWebRTC] ICE connection state:', state);
      
      // Handle mobile-specific connection issues
      if (state === 'failed' || state === 'disconnected') {
        console.log('[MobileWebRTC] Connection issue detected, attempting restart');
        // Could implement ICE restart logic here
      }
    });
  }

  return peerConnection;
};

export const handleMobileAudioContext = (): Promise<AudioContext | null> => {
  return new Promise((resolve) => {
    const browserInfo = getMobileBrowserInfo();
    
    if (!browserInfo.isMobile) {
      resolve(null);
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        resolve(null);
        return;
      }

      const audioContext = new AudioContextClass();
      
      // iOS requires user interaction to start audio context
      if (browserInfo.isIOS && audioContext.state === 'suspended') {
        const resumeAudio = () => {
          audioContext.resume().then(() => {
            console.log('[MobileWebRTC] Audio context resumed for iOS');
            document.removeEventListener('touchstart', resumeAudio);
            document.removeEventListener('click', resumeAudio);
            resolve(audioContext);
          }).catch(() => {
            resolve(null);
          });
        };
        
        document.addEventListener('touchstart', resumeAudio, { once: true });
        document.addEventListener('click', resumeAudio, { once: true });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          document.removeEventListener('touchstart', resumeAudio);
          document.removeEventListener('click', resumeAudio);
          resolve(audioContext);
        }, 5000);
      } else {
        resolve(audioContext);
      }
    } catch (error) {
      console.error('[MobileWebRTC] Error creating audio context:', error);
      resolve(null);
    }
  });
};

export const optimizeCallForMobile = (peerConnection: RTCPeerConnection, callType: 'audio' | 'video') => {
  const browserInfo = getMobileBrowserInfo();
  
  if (!browserInfo.isMobile) return;

  // Set mobile-optimized codec preferences
  const transceivers = peerConnection.getTransceivers();
  
  transceivers.forEach(transceiver => {
    if (transceiver.sender && transceiver.sender.track) {
      const track = transceiver.sender.track;
      
      if (track.kind === 'audio') {
        // Prefer mobile-optimized audio codecs
        const audioCodecs = ['opus', 'PCMU', 'PCMA'];
        // Could implement codec preference logic here
      } else if (track.kind === 'video' && callType === 'video') {
        // Prefer mobile-optimized video codecs
        const videoCodecs = ['VP8', 'H264'];
        // Could implement codec preference logic here
        
        // Reduce video bitrate for mobile
        const params = transceiver.sender.getParameters();
        if (params.encodings && params.encodings.length > 0) {
          params.encodings[0].maxBitrate = browserInfo.isIOS ? 500000 : 800000; // 500kbps for iOS, 800kbps for Android
          transceiver.sender.setParameters(params);
        }
      }
    }
  });
};

// Global declarations for older browser compatibility
declare global {
  interface Navigator {
    getUserMedia?: (constraints: MediaStreamConstraints, success: (stream: MediaStream) => void, error: (error: any) => void) => void;
    webkitGetUserMedia?: (constraints: MediaStreamConstraints, success: (stream: MediaStream) => void, error: (error: any) => void) => void;
    mozGetUserMedia?: (constraints: MediaStreamConstraints, success: (stream: MediaStream) => void, error: (error: any) => void) => void;
  }

  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }

  var webkitRTCPeerConnection: typeof RTCPeerConnection;
  var mozRTCPeerConnection: typeof RTCPeerConnection;
}