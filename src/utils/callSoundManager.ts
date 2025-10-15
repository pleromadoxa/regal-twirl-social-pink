// Global call sound manager to ensure sounds are properly stopped across all components
class CallSoundManager {
  private static instance: CallSoundManager;
  private ringingInterval: number | null = null;
  private oscillators: OscillatorNode[] = [];
  private audioContexts: AudioContext[] = [];
  private isRinging = false;

  private constructor() {}

  static getInstance(): CallSoundManager {
    if (!CallSoundManager.instance) {
      CallSoundManager.instance = new CallSoundManager();
    }
    return CallSoundManager.instance;
  }

  private createPhoneRingingTone(): { oscillator1: OscillatorNode; oscillator2: OscillatorNode; audioContext: AudioContext } {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const gainNode2 = audioContext.createGain();
    const masterGain = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode2);
    gainNode.connect(masterGain);
    gainNode2.connect(masterGain);
    masterGain.connect(audioContext.destination);
    
    oscillator1.frequency.value = 480;
    oscillator2.frequency.value = 620;
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    
    const volume = 0.15;
    masterGain.gain.setValueAtTime(0, audioContext.currentTime);
    masterGain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
    masterGain.gain.setValueAtTime(volume, audioContext.currentTime + 2);
    masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2.1);
    
    return { oscillator1, oscillator2, audioContext };
  }

  startRinging(): void {
    console.log('[CallSoundManager] Starting ringing sound');
    
    // Stop any existing ringing first
    this.stopRinging();
    
    this.isRinging = true;
    
    try {
      const { oscillator1, oscillator2, audioContext } = this.createPhoneRingingTone();
      this.oscillators.push(oscillator1, oscillator2);
      this.audioContexts.push(audioContext);
      
      oscillator1.start();
      oscillator2.start();
      
      setTimeout(() => {
        try {
          oscillator1.stop();
          oscillator2.stop();
        } catch (e) {
          // Ignore errors
        }
      }, 2100);
      
      // Create repeating pattern
      this.ringingInterval = window.setInterval(() => {
        if (this.isRinging) {
          try {
            const { oscillator1: newOsc1, oscillator2: newOsc2, audioContext: newContext } = this.createPhoneRingingTone();
            this.oscillators.push(newOsc1, newOsc2);
            this.audioContexts.push(newContext);
            
            newOsc1.start();
            newOsc2.start();
            
            setTimeout(() => {
              try {
                newOsc1.stop();
                newOsc2.stop();
              } catch (e) {
                // Ignore errors
              }
            }, 2100);
          } catch (e) {
            console.warn('[CallSoundManager] Error in ringing interval:', e);
          }
        }
      }, 6000);
      
      console.log('[CallSoundManager] Ringing sound started');
    } catch (error) {
      console.error('[CallSoundManager] Error starting ringing:', error);
    }
  }

  stopRinging(): void {
    console.log('[CallSoundManager] Stopping ringing sound');
    
    this.isRinging = false;
    
    // Clear interval
    if (this.ringingInterval) {
      clearInterval(this.ringingInterval);
      this.ringingInterval = null;
    }
    
    // Stop all oscillators
    this.oscillators.forEach(oscillator => {
      try {
        oscillator.stop();
      } catch (e) {
        // Ignore errors
      }
    });
    this.oscillators = [];
    
    // Close all audio contexts
    this.audioContexts.forEach(context => {
      try {
        context.close();
      } catch (e) {
        // Ignore errors
      }
    });
    this.audioContexts = [];
    
    console.log('[CallSoundManager] Ringing sound stopped');
  }

  cleanup(): void {
    this.stopRinging();
  }
}

export const callSoundManager = CallSoundManager.getInstance();
