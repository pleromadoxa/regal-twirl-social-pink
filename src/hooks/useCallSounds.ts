
import { useRef, useCallback } from 'react';

export const useCallSounds = () => {
  const ringingSoundRef = useRef<HTMLAudioElement | null>(null);
  const endCallSoundRef = useRef<HTMLAudioElement | null>(null);
  const connectSoundRef = useRef<HTMLAudioElement | null>(null);

  // Create audio elements on first use
  const initializeSounds = useCallback(() => {
    if (!ringingSoundRef.current) {
      // Create a more realistic ringing tone using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create ring tone pattern
      const createRingTone = () => {
        const canvas = document.createElement('canvas');
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const length = audioCtx.sampleRate * 3; // 3 seconds
        const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
          const time = i / audioCtx.sampleRate;
          // Create ring pattern: 2 seconds ring, 1 second pause
          if (time % 3 < 2) {
            data[i] = Math.sin(2 * Math.PI * 440 * time) * 0.3 * Math.sin(2 * Math.PI * 2 * time);
          } else {
            data[i] = 0;
          }
        }
        
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        return { source, audioCtx };
      };
      
      // Fallback to simple audio element
      ringingSoundRef.current = new Audio();
      ringingSoundRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBj6X2vDEciUGK4DO8tiLOAcZaLzs43';
      ringingSoundRef.current.loop = true;
      ringingSoundRef.current.volume = 0.5;
    }

    if (!endCallSoundRef.current) {
      endCallSoundRef.current = new Audio();
      endCallSoundRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACDhYqFbF1fdJevrJFhNjNgodDbq2EcBj+Z2/LDciUFLIHO8diOOAcYZ7vs55hNEAtRpuLxt2QcBzmR1/LNeSwEI3fH8N+QQQoUXrTp66hUFApGnt/yv2EcBj6X2u/EcycEKYDO8tiLOQcZZ7vs5Y4/ESJgp+LyxHAlBzyP2vLXfSkFQ4nW8tiLOgcYZ7zr5ZhNEAy+VksG8ZAAB9iJOgYZZ7ru5ZhNEBAZZ7zt5ZhNEBAZaLzu5ZhNEBIW5';
      endCallSoundRef.current.volume = 0.7;
    }

    if (!connectSoundRef.current) {
      connectSoundRef.current = new Audio();
      connectSoundRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAGBhYqFbF1fdJCvrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt5p';
      connectSoundRef.current.volume = 0.6;
    }
  }, []);

  const playRinging = useCallback(() => {
    initializeSounds();
    if (ringingSoundRef.current) {
      ringingSoundRef.current.currentTime = 0;
      ringingSoundRef.current.play().catch((error) => {
        console.log('Could not play ringing sound:', error);
        // Fallback: create beep sound programmatically
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.2);
          
          // Repeat every second
          const interval = setInterval(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.setValueAtTime(800, audioContext.currentTime);
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            osc.start();
            osc.stop(audioContext.currentTime + 0.2);
          }, 1000);
          
          // Store interval to clear later
          (ringingSoundRef.current as any).fallbackInterval = interval;
        } catch (fallbackError) {
          console.log('Fallback sound also failed:', fallbackError);
        }
      });
    }
  }, [initializeSounds]);

  const stopRinging = useCallback(() => {
    if (ringingSoundRef.current) {
      ringingSoundRef.current.pause();
      ringingSoundRef.current.currentTime = 0;
      
      // Clear fallback interval if it exists
      if ((ringingSoundRef.current as any).fallbackInterval) {
        clearInterval((ringingSoundRef.current as any).fallbackInterval);
        (ringingSoundRef.current as any).fallbackInterval = null;
      }
    }
  }, []);

  const playEndCall = useCallback(() => {
    initializeSounds();
    if (endCallSoundRef.current) {
      endCallSoundRef.current.currentTime = 0;
      endCallSoundRef.current.play().catch(console.error);
    }
  }, [initializeSounds]);

  const playConnect = useCallback(() => {
    initializeSounds();
    if (connectSoundRef.current) {
      connectSoundRef.current.currentTime = 0;
      connectSoundRef.current.play().catch(console.error);
    }
  }, [initializeSounds]);

  return {
    playRinging,
    stopRinging,
    playEndCall,
    playConnect
  };
};
