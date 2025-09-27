export interface NetworkStats {
  bitrate: number;
  packetLoss: number;
  rtt: number;
  jitter: number;
  fractionLost: number;
}

export interface QualityMetrics {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
  audio: NetworkStats;
  video?: NetworkStats;
  timestamp: number;
}

export class NetworkQualityMonitor {
  private peerConnection: RTCPeerConnection | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private callbacks: ((metrics: QualityMetrics) => void)[] = [];
  private lastStats: QualityMetrics | null = null;

  constructor() {
    console.log('[NetworkQualityMonitor] Initialized');
  }

  startMonitoring(peerConnection: RTCPeerConnection, intervalMs = 2000) {
    if (this.isMonitoring) {
      console.log('[NetworkQualityMonitor] Already monitoring');
      return;
    }

    this.peerConnection = peerConnection;
    this.isMonitoring = true;

    console.log('[NetworkQualityMonitor] Starting quality monitoring');

    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.gatherQualityMetrics();
        if (metrics) {
          this.lastStats = metrics;
          this.notifyCallbacks(metrics);
        }
      } catch (error) {
        console.error('[NetworkQualityMonitor] Error gathering metrics:', error);
      }
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    this.peerConnection = null;
    console.log('[NetworkQualityMonitor] Stopped monitoring');
  }

  onQualityUpdate(callback: (metrics: QualityMetrics) => void) {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (metrics: QualityMetrics) => void) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  getLastStats(): QualityMetrics | null {
    return this.lastStats;
  }

  private async gatherQualityMetrics(): Promise<QualityMetrics | null> {
    if (!this.peerConnection) return null;

    try {
      const stats = await this.peerConnection.getStats();
      const audioStats = this.extractAudioStats(stats);
      const videoStats = this.extractVideoStats(stats);

      const quality: QualityMetrics = {
        overall: this.calculateOverallQuality(audioStats, videoStats),
        audio: audioStats,
        video: videoStats,
        timestamp: Date.now()
      };

      return quality;
    } catch (error) {
      console.error('[NetworkQualityMonitor] Failed to gather stats:', error);
      return null;
    }
  }

  private extractAudioStats(stats: RTCStatsReport): NetworkStats {
    let bitrate = 0;
    let packetLoss = 0;
    let rtt = 0;
    let jitter = 0;
    let fractionLost = 0;

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.mediaType === 'audio') {
        bitrate = report.bytesReceived ? (report.bytesReceived * 8) / 1000 : 0;
        packetLoss = report.packetsLost || 0;
        jitter = report.jitter || 0;
        fractionLost = report.fractionLost || 0;
      } else if (report.type === 'remote-inbound-rtp' && report.mediaType === 'audio') {
        rtt = report.roundTripTime ? report.roundTripTime * 1000 : 0;
        fractionLost = Math.max(fractionLost, report.fractionLost || 0);
      }
    });

    return { bitrate, packetLoss, rtt, jitter, fractionLost };
  }

  private extractVideoStats(stats: RTCStatsReport): NetworkStats | undefined {
    let bitrate = 0;
    let packetLoss = 0;
    let rtt = 0;
    let jitter = 0;
    let fractionLost = 0;
    let hasVideo = false;

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        hasVideo = true;
        bitrate = report.bytesReceived ? (report.bytesReceived * 8) / 1000 : 0;
        packetLoss = report.packetsLost || 0;
        jitter = report.jitter || 0;
        fractionLost = report.fractionLost || 0;
      } else if (report.type === 'remote-inbound-rtp' && report.mediaType === 'video') {
        hasVideo = true;
        rtt = report.roundTripTime ? report.roundTripTime * 1000 : 0;
        fractionLost = Math.max(fractionLost, report.fractionLost || 0);
      }
    });

    return hasVideo ? { bitrate, packetLoss, rtt, jitter, fractionLost } : undefined;
  }

  private calculateOverallQuality(audio: NetworkStats, video?: NetworkStats): 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected' {
    // Check if we have any meaningful data
    if (audio.bitrate === 0 && (!video || video.bitrate === 0)) {
      return 'disconnected';
    }

    const audioScore = this.calculateMediaScore(audio);
    const videoScore = video ? this.calculateMediaScore(video) : audioScore;
    
    // Take the worse of audio and video
    const overallScore = Math.min(audioScore, videoScore);

    if (overallScore >= 80) return 'excellent';
    if (overallScore >= 60) return 'good';
    if (overallScore >= 40) return 'fair';
    if (overallScore >= 20) return 'poor';
    return 'disconnected';
  }

  private calculateMediaScore(stats: NetworkStats): number {
    let score = 100;

    // Penalize high packet loss (0-5% is acceptable)
    if (stats.fractionLost > 0.05) {
      score -= Math.min(50, stats.fractionLost * 1000); // Heavy penalty for >5% loss
    } else if (stats.fractionLost > 0.02) {
      score -= stats.fractionLost * 500; // Moderate penalty for 2-5% loss
    }

    // Penalize high RTT (>200ms is poor)
    if (stats.rtt > 200) {
      score -= Math.min(30, (stats.rtt - 200) / 10);
    } else if (stats.rtt > 100) {
      score -= (stats.rtt - 100) / 10;
    }

    // Penalize low bitrate (varies by media type)
    const minBitrate = stats.bitrate > 50000 ? 50000 : 25000; // Assume video if >50kbps
    if (stats.bitrate < minBitrate) {
      score -= (minBitrate - stats.bitrate) / 1000;
    }

    // Penalize high jitter (>30ms is poor for audio)
    if (stats.jitter > 0.03) {
      score -= Math.min(20, (stats.jitter - 0.03) * 1000);
    }

    return Math.max(0, Math.min(100, score));
  }

  private notifyCallbacks(metrics: QualityMetrics) {
    this.callbacks.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        console.error('[NetworkQualityMonitor] Error in callback:', error);
      }
    });
  }

  // Network condition detection
  detectNetworkCondition(): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' {
    if (!this.lastStats) return 'unknown';
    
    const { audio, video } = this.lastStats;
    
    // Consider both audio and video metrics
    const audioCondition = this.getConditionFromStats(audio);
    const videoCondition = video ? this.getConditionFromStats(video) : audioCondition;
    
    // Return the worse condition
    const conditions = ['excellent', 'good', 'fair', 'poor'];
    const audioIndex = conditions.indexOf(audioCondition);
    const videoIndex = conditions.indexOf(videoCondition);
    
    return conditions[Math.max(audioIndex, videoIndex)] as 'excellent' | 'good' | 'fair' | 'poor';
  }

  private getConditionFromStats(stats: NetworkStats): 'excellent' | 'good' | 'fair' | 'poor' {
    const score = this.calculateMediaScore(stats);
    
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }
}

// Singleton instance
export const networkQualityMonitor = new NetworkQualityMonitor();