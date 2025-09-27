import { networkQualityMonitor, type QualityMetrics } from './networkQualityMonitor';

export interface ResilienceConfig {
  maxReconnectAttempts: number;
  reconnectDelay: number;
  escalationFactor: number;
  healthCheckInterval: number;
  connectionTimeout: number;
}

export interface ConnectionHealth {
  isHealthy: boolean;
  consecutiveFailures: number;
  lastSuccessfulCheck: number;
  currentState: 'healthy' | 'degraded' | 'failing' | 'failed';
}

export class ConnectionResilienceManager {
  private peerConnection: RTCPeerConnection | null = null;
  private config: ResilienceConfig;
  private reconnectAttempts = 0;
  private isReconnecting = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private connectionHealth: ConnectionHealth = {
    isHealthy: true,
    consecutiveFailures: 0,
    lastSuccessfulCheck: Date.now(),
    currentState: 'healthy'
  };

  private onReconnectAttempt?: (attempt: number, maxAttempts: number) => void;
  private onReconnectSuccess?: () => void;
  private onReconnectFailed?: () => void;
  private onHealthChange?: (health: ConnectionHealth) => void;

  constructor(config?: Partial<ResilienceConfig>) {
    this.config = {
      maxReconnectAttempts: 5,
      reconnectDelay: 2000,
      escalationFactor: 1.5,
      healthCheckInterval: 5000,
      connectionTimeout: 10000,
      ...config
    };

    console.log('[ConnectionResilienceManager] Initialized with config:', this.config);
  }

  initialize(peerConnection: RTCPeerConnection) {
    this.peerConnection = peerConnection;
    this.setupConnectionMonitoring();
    this.startHealthCheck();
    console.log('[ConnectionResilienceManager] Initialized for peer connection');
  }

  private setupConnectionMonitoring() {
    if (!this.peerConnection) return;

    // Monitor ICE connection state changes
    this.peerConnection.addEventListener('iceconnectionstatechange', () => {
      const state = this.peerConnection?.iceConnectionState;
      console.log('[ConnectionResilienceManager] ICE connection state:', state);

      switch (state) {
        case 'connected':
        case 'completed':
          this.handleConnectionSuccess();
          break;
        case 'disconnected':
          this.handleConnectionDegraded();
          break;
        case 'failed':
          this.handleConnectionFailure();
          break;
        case 'checking':
          this.updateHealthState('degraded');
          break;
      }
    });

    // Monitor peer connection state changes
    this.peerConnection.addEventListener('connectionstatechange', () => {
      const state = this.peerConnection?.connectionState;
      console.log('[ConnectionResilienceManager] Peer connection state:', state);

      switch (state) {
        case 'connected':
          this.handleConnectionSuccess();
          break;
        case 'connecting':
          this.updateHealthState('degraded');
          break;
        case 'disconnected':
          this.handleConnectionDegraded();
          break;
        case 'failed':
          this.handleConnectionFailure();
          break;
      }
    });

    // Monitor network quality
    networkQualityMonitor.onQualityUpdate((metrics: QualityMetrics) => {
      this.assessNetworkHealth(metrics);
    });
  }

  private startHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  private async performHealthCheck() {
    if (!this.peerConnection) return;

    try {
      // Check if peer connection is in a good state
      const iceState = this.peerConnection.iceConnectionState;
      const connectionState = this.peerConnection.connectionState;

      const isConnectionHealthy = 
        (iceState === 'connected' || iceState === 'completed') &&
        (connectionState === 'connected');

      if (isConnectionHealthy) {
        this.handleConnectionSuccess();
      } else if (iceState === 'disconnected' || connectionState === 'disconnected') {
        this.handleConnectionDegraded();
      } else if (iceState === 'failed' || connectionState === 'failed') {
        this.handleConnectionFailure();
      }

      // Additional check: Try to get stats to verify connection
      try {
        await this.peerConnection.getStats();
        // If we can get stats successfully, connection is working
        if (!isConnectionHealthy) {
          // Stats work but states are not ideal - degraded but functional
          this.updateHealthState('degraded');
        }
      } catch (error) {
        console.warn('[ConnectionResilienceManager] Failed to get stats:', error);
        this.connectionHealth.consecutiveFailures++;
      }

    } catch (error) {
      console.error('[ConnectionResilienceManager] Health check failed:', error);
      this.connectionHealth.consecutiveFailures++;
      this.updateHealthState('failing');
    }
  }

  private handleConnectionSuccess() {
    console.log('[ConnectionResilienceManager] Connection successful');
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.connectionHealth = {
      isHealthy: true,
      consecutiveFailures: 0,
      lastSuccessfulCheck: Date.now(),
      currentState: 'healthy'
    };

    if (this.onReconnectSuccess) {
      this.onReconnectSuccess();
    }

    this.notifyHealthChange();
  }

  private handleConnectionDegraded() {
    console.log('[ConnectionResilienceManager] Connection degraded');
    this.updateHealthState('degraded');
    
    // Don't immediately reconnect for degraded connections
    // Wait to see if it recovers naturally
    setTimeout(() => {
      if (this.connectionHealth.currentState === 'degraded') {
        this.attemptReconnection();
      }
    }, this.config.reconnectDelay);
  }

  private handleConnectionFailure() {
    console.log('[ConnectionResilienceManager] Connection failed');
    this.updateHealthState('failed');
    this.attemptReconnection();
  }

  private updateHealthState(state: ConnectionHealth['currentState']) {
    const wasHealthy = this.connectionHealth.isHealthy;
    
    this.connectionHealth.currentState = state;
    this.connectionHealth.isHealthy = state === 'healthy';
    
    if (state !== 'healthy') {
      this.connectionHealth.consecutiveFailures++;
    }

    if (wasHealthy !== this.connectionHealth.isHealthy) {
      console.log('[ConnectionResilienceManager] Health state changed to:', state);
      this.notifyHealthChange();
    }
  }

  private async attemptReconnection() {
    if (this.isReconnecting || this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
        console.log('[ConnectionResilienceManager] Max reconnect attempts reached');
        if (this.onReconnectFailed) {
          this.onReconnectFailed();
        }
      }
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    console.log(`[ConnectionResilienceManager] Attempting reconnection ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
    
    if (this.onReconnectAttempt) {
      this.onReconnectAttempt(this.reconnectAttempts, this.config.maxReconnectAttempts);
    }

    try {
      // Attempt ICE restart if supported
      if (this.peerConnection && this.peerConnection.restartIce) {
        console.log('[ConnectionResilienceManager] Restarting ICE');
        this.peerConnection.restartIce();
      }

      // Wait for the connection to potentially recover
      const timeout = this.config.connectionTimeout * Math.pow(this.config.escalationFactor, this.reconnectAttempts - 1);
      
      await new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          const iceState = this.peerConnection?.iceConnectionState;
          const connectionState = this.peerConnection?.connectionState;
          
          if (iceState === 'connected' || iceState === 'completed' || connectionState === 'connected') {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 1000);

        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Connection timeout'));
        }, timeout);
      });

      // If we get here, reconnection was successful
      this.handleConnectionSuccess();

    } catch (error) {
      console.error(`[ConnectionResilienceManager] Reconnection attempt ${this.reconnectAttempts} failed:`, error);
      this.isReconnecting = false;
      
      // Schedule next attempt with exponential backoff
      const delay = this.config.reconnectDelay * Math.pow(this.config.escalationFactor, this.reconnectAttempts - 1);
      setTimeout(() => {
        this.attemptReconnection();
      }, delay);
    }
  }

  private assessNetworkHealth(metrics: QualityMetrics) {
    // Use network quality to inform connection health
    if (metrics.overall === 'excellent' || metrics.overall === 'good') {
      if (this.connectionHealth.currentState === 'degraded') {
        // Network is good but connection is degraded - keep current state
        return;
      }
    } else if (metrics.overall === 'poor' || metrics.overall === 'disconnected') {
      if (this.connectionHealth.currentState === 'healthy') {
        this.updateHealthState('degraded');
      }
    }
  }

  private notifyHealthChange() {
    if (this.onHealthChange) {
      this.onHealthChange({ ...this.connectionHealth });
    }
  }

  // Public API
  onReconnectionAttempt(callback: (attempt: number, maxAttempts: number) => void) {
    this.onReconnectAttempt = callback;
  }

  onReconnectionSuccess(callback: () => void) {
    this.onReconnectSuccess = callback;
  }

  onReconnectionFailed(callback: () => void) {
    this.onReconnectFailed = callback;
  }

  onHealthStateChange(callback: (health: ConnectionHealth) => void) {
    this.onHealthChange = callback;
  }

  getHealth(): ConnectionHealth {
    return { ...this.connectionHealth };
  }

  forceReconnect() {
    console.log('[ConnectionResilienceManager] Forcing reconnection');
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.attemptReconnection();
  }

  cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    this.peerConnection = null;
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
    
    console.log('[ConnectionResilienceManager] Cleaned up');
  }
}

// Export singleton
export const connectionResilienceManager = new ConnectionResilienceManager();
