/**
 * Media Permission Manager - Handles microphone and camera permissions
 * Prevents multiple simultaneous access attempts and provides proper cleanup
 */

class MediaPermissionManager {
  private activeStreams = new Set<MediaStream>();
  private permissionStates = new Map<string, PermissionState>();
  private requestInProgress = false;
  private lastRequestTime = 0;
  private readonly REQUEST_COOLDOWN = 1000; // 1 second cooldown between requests

  /**
   * Request media permissions with proper error handling and cooldown
   */
  async requestMediaPermissions(constraints: MediaStreamConstraints): Promise<MediaStream> {
    console.log('[MediaPermissionManager] Requesting permissions:', constraints);

    // Prevent rapid successive requests
    const now = Date.now();
    if (this.requestInProgress) {
      console.log('[MediaPermissionManager] Request already in progress, waiting...');
      throw new Error('Media request already in progress');
    }

    if (now - this.lastRequestTime < this.REQUEST_COOLDOWN) {
      console.log('[MediaPermissionManager] Cooldown active, waiting...');
      throw new Error('Please wait before requesting permissions again');
    }

    this.requestInProgress = true;
    this.lastRequestTime = now;

    try {
      // Check current permission state
      await this.checkPermissionState(constraints);

      // Request media access
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Track the stream
      this.activeStreams.add(stream);
      console.log('[MediaPermissionManager] Successfully obtained stream, active streams:', this.activeStreams.size);

      // Set up cleanup when tracks end
      stream.getTracks().forEach(track => {
        track.addEventListener('ended', () => {
          console.log('[MediaPermissionManager] Track ended:', track.kind);
          this.cleanupStream(stream);
        });
      });

      return stream;
    } catch (error) {
      console.error('[MediaPermissionManager] Permission request failed:', error);
      this.handlePermissionError(error as Error, constraints);
      throw error;
    } finally {
      this.requestInProgress = false;
    }
  }

  /**
   * Check current permission state
   */
  private async checkPermissionState(constraints: MediaStreamConstraints): Promise<void> {
    try {
      if (constraints.audio) {
        const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        this.permissionStates.set('microphone', micPermission.state);
        console.log('[MediaPermissionManager] Microphone permission:', micPermission.state);

        if (micPermission.state === 'denied') {
          throw new Error('Microphone access denied. Please enable microphone permissions in your browser settings.');
        }
      }

      if (constraints.video) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        this.permissionStates.set('camera', cameraPermission.state);
        console.log('[MediaPermissionManager] Camera permission:', cameraPermission.state);

        if (cameraPermission.state === 'denied') {
          throw new Error('Camera access denied. Please enable camera permissions in your browser settings.');
        }
      }
    } catch (error) {
      console.warn('[MediaPermissionManager] Could not check permission state:', error);
      // Continue anyway, as some browsers don't support permissions API
    }
  }

  /**
   * Handle permission errors with user-friendly messages
   */
  private handlePermissionError(error: Error, constraints: MediaStreamConstraints): void {
    const deviceType = constraints.video ? 'camera and microphone' : 'microphone';
    
    switch (error.name) {
      case 'NotAllowedError':
        console.error(`[MediaPermissionManager] Permission denied for ${deviceType}`);
        break;
      case 'NotFoundError':
        console.error(`[MediaPermissionManager] No ${deviceType} found`);
        break;
      case 'NotReadableError':
        console.error(`[MediaPermissionManager] ${deviceType} is already in use`);
        break;
      case 'OverconstrainedError':
        console.error(`[MediaPermissionManager] ${deviceType} constraints not supported`);
        break;
      default:
        console.error('[MediaPermissionManager] Unknown media error:', error);
    }
  }

  /**
   * Properly clean up a media stream
   */
  cleanupStream(stream: MediaStream): void {
    if (!stream) return;

    console.log('[MediaPermissionManager] Cleaning up stream with tracks:', stream.getTracks().length);
    
    // Stop all tracks
    stream.getTracks().forEach(track => {
      console.log(`[MediaPermissionManager] Stopping ${track.kind} track`);
      track.stop();
    });

    // Remove from active streams
    this.activeStreams.delete(stream);
    console.log('[MediaPermissionManager] Stream cleaned up, active streams:', this.activeStreams.size);
  }

  /**
   * Clean up all active streams
   */
  cleanupAllStreams(): void {
    console.log('[MediaPermissionManager] Cleaning up all streams, count:', this.activeStreams.size);
    
    this.activeStreams.forEach(stream => {
      this.cleanupStream(stream);
    });
    
    this.activeStreams.clear();
  }

  /**
   * Get current active stream count
   */
  getActiveStreamCount(): number {
    return this.activeStreams.size;
  }

  /**
   * Get permission state for a device
   */
  getPermissionState(device: 'microphone' | 'camera'): PermissionState | undefined {
    return this.permissionStates.get(device);
  }

  /**
   * Reset cooldown (for testing)
   */
  resetCooldown(): void {
    this.lastRequestTime = 0;
    this.requestInProgress = false;
  }
}

// Export singleton instance
export const mediaPermissionManager = new MediaPermissionManager();