import { networkQualityMonitor, type QualityMetrics } from './networkQualityMonitor';
import { getMobileBrowserInfo } from '@/utils/mobileWebRTC';

export interface QualityProfile {
  name: string;
  video?: {
    width: number;
    height: number;
    frameRate: number;
    bitrate: number;
  };
  audio: {
    bitrate: number;
    sampleRate: number;
    channelCount: number;
  };
}

export interface AdaptiveSettings {
  enableAdaptiveBitrate: boolean;
  enableQualityScaling: boolean;
  maxFrameRate: number;
  minFrameRate: number;
  maxBitrate: number;
  minBitrate: number;
  adaptationInterval: number;
}

export class AdaptiveQualityManager {
  private peerConnection: RTCPeerConnection | null = null;
  private currentProfile: QualityProfile | null = null;
  private settings: AdaptiveSettings;
  private adaptationInterval: NodeJS.Timeout | null = null;
  private isAdapting = false;
  private lastAdaptation = 0;
  private consecutivePoorQuality = 0;
  private consecutiveGoodQuality = 0;

  private qualityProfiles: Record<string, QualityProfile> = {
    ultra: {
      name: 'Ultra HD',
      video: { width: 1920, height: 1080, frameRate: 30, bitrate: 2500000 },
      audio: { bitrate: 128000, sampleRate: 48000, channelCount: 2 }
    },
    high: {
      name: 'High Definition',
      video: { width: 1280, height: 720, frameRate: 30, bitrate: 1500000 },
      audio: { bitrate: 64000, sampleRate: 48000, channelCount: 1 }
    },
    medium: {
      name: 'Standard Definition',
      video: { width: 854, height: 480, frameRate: 24, bitrate: 800000 },
      audio: { bitrate: 32000, sampleRate: 44100, channelCount: 1 }
    },
    low: {
      name: 'Low Definition',
      video: { width: 640, height: 360, frameRate: 15, bitrate: 400000 },
      audio: { bitrate: 24000, sampleRate: 22050, channelCount: 1 }
    },
    minimal: {
      name: 'Minimal Quality',
      video: { width: 320, height: 240, frameRate: 10, bitrate: 150000 },
      audio: { bitrate: 16000, sampleRate: 16000, channelCount: 1 }
    },
    audioOnly: {
      name: 'Audio Only',
      audio: { bitrate: 32000, sampleRate: 22050, channelCount: 1 }
    }
  };

  private onQualityChange?: (profile: QualityProfile) => void;
  private onAdaptationEvent?: (event: { type: 'upgrade' | 'downgrade', from: string, to: string, reason: string }) => void;

  constructor(settings?: Partial<AdaptiveSettings>) {
    this.settings = {
      enableAdaptiveBitrate: true,
      enableQualityScaling: true,
      maxFrameRate: 30,
      minFrameRate: 10,
      maxBitrate: 2500000,
      minBitrate: 150000,
      adaptationInterval: 5000,
      ...settings
    };

    console.log('[AdaptiveQualityManager] Initialized with settings:', this.settings);
  }

  initialize(peerConnection: RTCPeerConnection, callType: 'audio' | 'video') {
    this.peerConnection = peerConnection;
    
    // Set initial quality profile based on device and network
    const browserInfo = getMobileBrowserInfo();
    const initialProfile = this.selectInitialProfile(callType, browserInfo.isMobile);
    
    this.currentProfile = initialProfile;
    console.log('[AdaptiveQualityManager] Initial profile:', initialProfile.name);

    // Start monitoring and adaptation
    this.startAdaptation();
    
    // Apply initial settings
    this.applyQualityProfile(initialProfile);
  }

  private selectInitialProfile(callType: 'audio' | 'video', isMobile: boolean): QualityProfile {
    if (callType === 'audio') {
      return this.qualityProfiles.audioOnly;
    }

    // Start with medium quality for video calls
    if (isMobile) {
      return this.qualityProfiles.low; // Conservative start for mobile
    } else {
      return this.qualityProfiles.medium; // Better start for desktop
    }
  }

  private startAdaptation() {
    if (!this.settings.enableQualityScaling && !this.settings.enableAdaptiveBitrate) {
      return;
    }

    // Listen to network quality updates
    networkQualityMonitor.onQualityUpdate((metrics: QualityMetrics) => {
      this.handleQualityMetrics(metrics);
    });

    // Periodic adaptation check
    this.adaptationInterval = setInterval(() => {
      this.performAdaptationCheck();
    }, this.settings.adaptationInterval);

    console.log('[AdaptiveQualityManager] Started adaptation monitoring');
  }

  private handleQualityMetrics(metrics: QualityMetrics) {
    if (!this.settings.enableQualityScaling || this.isAdapting) {
      return;
    }

    const now = Date.now();
    if (now - this.lastAdaptation < this.settings.adaptationInterval) {
      return; // Too soon since last adaptation
    }

    // Determine if we need to adapt based on quality
    if (metrics.overall === 'poor' || metrics.overall === 'disconnected') {
      this.consecutivePoorQuality++;
      this.consecutiveGoodQuality = 0;
      
      if (this.consecutivePoorQuality >= 2) {
        this.adaptDown('Poor network quality detected');
      }
    } else if (metrics.overall === 'excellent' || metrics.overall === 'good') {
      this.consecutiveGoodQuality++;
      this.consecutivePoorQuality = 0;
      
      if (this.consecutiveGoodQuality >= 3) {
        this.adaptUp('Good network quality sustained');
      }
    } else {
      // Fair quality - maintain current settings
      this.consecutivePoorQuality = 0;
      this.consecutiveGoodQuality = 0;
    }
  }

  private performAdaptationCheck() {
    if (!this.peerConnection || !this.currentProfile) return;

    // Check if we need to adapt based on WebRTC stats
    this.peerConnection.getStats().then(stats => {
      const analysis = this.analyzeStats(stats);
      
      if (analysis.shouldDowngrade) {
        this.adaptDown(analysis.reason);
      } else if (analysis.shouldUpgrade) {
        this.adaptUp(analysis.reason);
      }
    }).catch(error => {
      console.error('[AdaptiveQualityManager] Error analyzing stats:', error);
    });
  }

  private analyzeStats(stats: RTCStatsReport): { shouldUpgrade: boolean; shouldDowngrade: boolean; reason: string } {
    let shouldUpgrade = false;
    let shouldDowngrade = false;
    let reason = '';

    stats.forEach(report => {
      if (report.type === 'outbound-rtp') {
        const fractionLost = report.fractionLost || 0;
        const currentBitrate = report.bytesSent ? (report.bytesSent * 8) / 1000 : 0;
        
        // Downgrade if high packet loss
        if (fractionLost > 0.05) { // >5% packet loss
          shouldDowngrade = true;
          reason = `High packet loss: ${(fractionLost * 100).toFixed(1)}%`;
        }
        
        // Upgrade if consistently low packet loss and we're not at max quality
        if (fractionLost < 0.01 && currentBitrate > 0 && this.canUpgrade()) {
          shouldUpgrade = true;
          reason = 'Stable connection with low packet loss';
        }
      }
      
      if (report.type === 'remote-inbound-rtp') {
        const rtt = report.roundTripTime || 0;
        
        // Downgrade if high RTT
        if (rtt > 0.3) { // >300ms RTT
          shouldDowngrade = true;
          reason = `High latency: ${(rtt * 1000).toFixed(0)}ms`;
        }
      }
    });

    return { shouldUpgrade, shouldDowngrade, reason };
  }

  private adaptUp(reason: string) {
    if (!this.currentProfile || this.isAdapting || !this.canUpgrade()) {
      return;
    }

    const currentLevel = this.getProfileLevel(this.currentProfile);
    const nextProfile = this.getProfileByLevel(currentLevel + 1);
    
    if (nextProfile) {
      console.log(`[AdaptiveQualityManager] Upgrading quality: ${this.currentProfile.name} -> ${nextProfile.name} (${reason})`);
      this.applyQualityProfile(nextProfile);
      
      if (this.onAdaptationEvent) {
        this.onAdaptationEvent({
          type: 'upgrade',
          from: this.currentProfile.name,
          to: nextProfile.name,
          reason
        });
      }
      
      this.currentProfile = nextProfile;
      this.lastAdaptation = Date.now();
      this.consecutiveGoodQuality = 0;
    }
  }

  private adaptDown(reason: string) {
    if (!this.currentProfile || this.isAdapting || !this.canDowngrade()) {
      return;
    }

    const currentLevel = this.getProfileLevel(this.currentProfile);
    const nextProfile = this.getProfileByLevel(currentLevel - 1);
    
    if (nextProfile) {
      console.log(`[AdaptiveQualityManager] Downgrading quality: ${this.currentProfile.name} -> ${nextProfile.name} (${reason})`);
      this.applyQualityProfile(nextProfile);
      
      if (this.onAdaptationEvent) {
        this.onAdaptationEvent({
          type: 'downgrade',
          from: this.currentProfile.name,
          to: nextProfile.name,
          reason
        });
      }
      
      this.currentProfile = nextProfile;
      this.lastAdaptation = Date.now();
      this.consecutivePoorQuality = 0;
    }
  }

  private canUpgrade(): boolean {
    return this.getProfileLevel(this.currentProfile!) < 4; // Max level is ultra (4)
  }

  private canDowngrade(): boolean {
    return this.getProfileLevel(this.currentProfile!) > 0; // Min level is minimal (0)
  }

  private getProfileLevel(profile: QualityProfile): number {
    switch (profile.name) {
      case 'Minimal Quality': return 0;
      case 'Low Definition': return 1;
      case 'Standard Definition': return 2;
      case 'High Definition': return 3;
      case 'Ultra HD': return 4;
      case 'Audio Only': return 0;
      default: return 2;
    }
  }

  private getProfileByLevel(level: number): QualityProfile | null {
    switch (level) {
      case 0: return this.qualityProfiles.minimal;
      case 1: return this.qualityProfiles.low;
      case 2: return this.qualityProfiles.medium;
      case 3: return this.qualityProfiles.high;
      case 4: return this.qualityProfiles.ultra;
      default: return null;
    }
  }

  private async applyQualityProfile(profile: QualityProfile) {
    if (!this.peerConnection) return;

    this.isAdapting = true;
    
    try {
      const senders = this.peerConnection.getSenders();
      
      for (const sender of senders) {
        if (!sender.track) continue;
        
        const params = sender.getParameters();
        
        if (sender.track.kind === 'video' && profile.video) {
          // Apply video quality settings
          if (params.encodings && params.encodings.length > 0) {
            params.encodings[0].maxBitrate = profile.video.bitrate;
            params.encodings[0].maxFramerate = profile.video.frameRate;
            
            // Apply resolution constraints to the track
            await sender.track.applyConstraints({
              width: { ideal: profile.video.width },
              height: { ideal: profile.video.height },
              frameRate: { ideal: profile.video.frameRate }
            });
          }
        } else if (sender.track.kind === 'audio') {
          // Apply audio quality settings
          if (params.encodings && params.encodings.length > 0) {
            params.encodings[0].maxBitrate = profile.audio.bitrate;
          }
          
          // Apply audio constraints
          await sender.track.applyConstraints({
            sampleRate: { ideal: profile.audio.sampleRate },
            channelCount: { ideal: profile.audio.channelCount }
          });
        }
        
        await sender.setParameters(params);
      }
      
      console.log('[AdaptiveQualityManager] Applied quality profile:', profile.name);
      
      if (this.onQualityChange) {
        this.onQualityChange(profile);
      }
      
    } catch (error) {
      console.error('[AdaptiveQualityManager] Error applying quality profile:', error);
    } finally {
      this.isAdapting = false;
    }
  }

  // Public API
  setQualityProfile(profileName: keyof typeof this.qualityProfiles) {
    const profile = this.qualityProfiles[profileName];
    if (profile) {
      this.currentProfile = profile;
      this.applyQualityProfile(profile);
      console.log('[AdaptiveQualityManager] Manually set quality profile:', profile.name);
    }
  }

  getCurrentProfile(): QualityProfile | null {
    return this.currentProfile;
  }

  getAvailableProfiles(): QualityProfile[] {
    return Object.values(this.qualityProfiles);
  }

  onQualityProfileChange(callback: (profile: QualityProfile) => void) {
    this.onQualityChange = callback;
  }

  onAdaptation(callback: (event: { type: 'upgrade' | 'downgrade', from: string, to: string, reason: string }) => void) {
    this.onAdaptationEvent = callback;
  }

  enableAdaptation(enable: boolean) {
    this.settings.enableQualityScaling = enable;
    this.settings.enableAdaptiveBitrate = enable;
    console.log('[AdaptiveQualityManager] Adaptation', enable ? 'enabled' : 'disabled');
  }

  cleanup() {
    if (this.adaptationInterval) {
      clearInterval(this.adaptationInterval);
      this.adaptationInterval = null;
    }
    
    this.peerConnection = null;
    this.currentProfile = null;
    this.isAdapting = false;
    
    console.log('[AdaptiveQualityManager] Cleaned up');
  }
}

// Export singleton
export const adaptiveQualityManager = new AdaptiveQualityManager();