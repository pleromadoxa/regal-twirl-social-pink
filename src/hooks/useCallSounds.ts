import { useEffect, useRef } from 'react';

export const useCallSounds = () => {
  const ringingAudioRef = useRef<HTMLAudioElement | null>(null);
  const connectAudioRef = useRef<HTMLAudioElement | null>(null);
  const endCallAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio elements for call sounds using Web Audio API
    ringingAudioRef.current = new Audio();
    connectAudioRef.current = new Audio();
    endCallAudioRef.current = new Audio();

    // Create simple audio tones using Web Audio API
    const createAudioTone = (frequency: number, duration: number, volume: number = 0.3) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
      
      return { oscillator, audioContext, duration };
    };

    // Store tone creators
    (ringingAudioRef.current as any).createTone = () => createAudioTone(800, 2, 0.2);
    (connectAudioRef.current as any).createTone = () => createAudioTone(1200, 0.5, 0.1);
    (endCallAudioRef.current as any).createTone = () => createAudioTone(400, 1, 0.15);

    // Set audio properties
    if (ringingAudioRef.current) {
      ringingAudioRef.current.loop = true;
      ringingAudioRef.current.volume = 0.5;
    }

    if (connectAudioRef.current) {
      connectAudioRef.current.volume = 0.3;
    }

    if (endCallAudioRef.current) {
      endCallAudioRef.current.volume = 0.3;
    }

    return () => {
      // Cleanup audio elements
      if (ringingAudioRef.current) {
        ringingAudioRef.current.pause();
      }
      if (connectAudioRef.current) {
        connectAudioRef.current.pause();
      }
      if (endCallAudioRef.current) {
        endCallAudioRef.current.pause();
      }
    };
  }, []);

  const playRinging = () => {
    try {
      if (ringingAudioRef.current && (ringingAudioRef.current as any).createTone) {
        const { oscillator, audioContext } = (ringingAudioRef.current as any).createTone();
        oscillator.start();
        
        // Create repeating ringing pattern
        const interval = setInterval(() => {
          if (ringingAudioRef.current && !(ringingAudioRef.current as any).stopped) {
            const { oscillator: newOsc } = (ringingAudioRef.current as any).createTone();
            newOsc.start();
            setTimeout(() => newOsc.stop(), 2000);
          } else {
            clearInterval(interval);
          }
        }, 3000);
        
        (ringingAudioRef.current as any).interval = interval;
        (ringingAudioRef.current as any).oscillator = oscillator;
        (ringingAudioRef.current as any).audioContext = audioContext;
      }
    } catch (error) {
      console.error('Error playing ringing sound:', error);
    }
  };

  const stopRinging = () => {
    try {
      if (ringingAudioRef.current) {
        (ringingAudioRef.current as any).stopped = true;
        
        if ((ringingAudioRef.current as any).interval) {
          clearInterval((ringingAudioRef.current as any).interval);
        }
        
        if ((ringingAudioRef.current as any).oscillator) {
          (ringingAudioRef.current as any).oscillator.stop();
        }
        
        if ((ringingAudioRef.current as any).audioContext) {
          (ringingAudioRef.current as any).audioContext.close();
        }
      }
    } catch (error) {
      console.error('Error stopping ringing sound:', error);
    }
  };

  const playConnect = () => {
    try {
      if (connectAudioRef.current && (connectAudioRef.current as any).createTone) {
        const { oscillator } = (connectAudioRef.current as any).createTone();
        oscillator.start();
        setTimeout(() => oscillator.stop(), 500);
      }
    } catch (error) {
      console.error('Error playing connect sound:', error);
    }
  };

  const playEndCall = () => {
    try {
      if (endCallAudioRef.current && (endCallAudioRef.current as any).createTone) {
        const { oscillator } = (endCallAudioRef.current as any).createTone();
        oscillator.start();
        setTimeout(() => oscillator.stop(), 1000);
      }
    } catch (error) {
      console.error('Error playing end call sound:', error);
    }
  };

  return {
    playRinging,
    stopRinging,
    playConnect,
    playEndCall
  };
};
