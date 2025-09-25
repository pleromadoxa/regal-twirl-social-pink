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

    // Create enhanced phone-like audio tones using Web Audio API
    const createPhoneRingingTone = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const gainNode2 = audioContext.createGain();
      const masterGain = audioContext.createGain();
      
      // Create dual-tone ringing like modern phones
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode2);
      gainNode.connect(masterGain);
      gainNode2.connect(masterGain);
      masterGain.connect(audioContext.destination);
      
      oscillator1.frequency.value = 480; // First tone
      oscillator2.frequency.value = 620; // Second tone (creates classic phone ring)
      oscillator1.type = 'sine';
      oscillator2.type = 'sine';
      
      // Ring pattern: on for 2 seconds, off for 4 seconds
      const volume = 0.15;
      masterGain.gain.setValueAtTime(0, audioContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
      masterGain.gain.setValueAtTime(volume, audioContext.currentTime + 2);
      masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2.1);
      
      return { oscillator1, oscillator2, audioContext };
    };

    const createConnectTone = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Pleasant connect chime - two ascending notes
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E note
      oscillator.frequency.setValueAtTime(830.61, audioContext.currentTime + 0.15); // G# note
      oscillator.type = 'sine';
      
      const volume = 0.1;
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.05);
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime + 0.15);
      gainNode.gain.linearRampToValueAtTime(volume * 0.8, audioContext.currentTime + 0.2);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      return { oscillator, audioContext };
    };

    const createEndCallTone = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Descending tone for call end
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.8);
      oscillator.type = 'sine';
      
      const volume = 0.12;
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
      
      return { oscillator, audioContext };
    };

    // Store tone creators
    (ringingAudioRef.current as any).createTone = createPhoneRingingTone;
    (connectAudioRef.current as any).createTone = createConnectTone;
    (endCallAudioRef.current as any).createTone = createEndCallTone;

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
        // Stop any existing ringing first
        stopRinging();
        
        const { oscillator1, oscillator2, audioContext } = (ringingAudioRef.current as any).createTone();
        oscillator1.start();
        oscillator2.start();
        
        // Create repeating ringing pattern (ring for 2s, pause for 4s)
        const interval = setInterval(() => {
          if (ringingAudioRef.current && !(ringingAudioRef.current as any).stopped) {
            try {
              const { oscillator1: newOsc1, oscillator2: newOsc2 } = (ringingAudioRef.current as any).createTone();
              newOsc1.start();
              newOsc2.start();
              setTimeout(() => {
                try {
                  newOsc1.stop();
                  newOsc2.stop();
                } catch (e) {
                  // Ignore stop errors
                }
              }, 2100);
            } catch (e) {
              console.warn('Error creating new ring tone:', e);
            }
          } else {
            clearInterval(interval);
          }
        }, 6000); // Repeat every 6 seconds (2s ring + 4s pause)
        
        (ringingAudioRef.current as any).interval = interval;
        (ringingAudioRef.current as any).oscillator1 = oscillator1;
        (ringingAudioRef.current as any).oscillator2 = oscillator2;
        (ringingAudioRef.current as any).audioContext = audioContext;
        (ringingAudioRef.current as any).stopped = false;
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
          (ringingAudioRef.current as any).interval = null;
        }
        
        if ((ringingAudioRef.current as any).oscillator1) {
          try {
            (ringingAudioRef.current as any).oscillator1.stop();
          } catch (e) {
            // Ignore stop errors
          }
          (ringingAudioRef.current as any).oscillator1 = null;
        }
        
        if ((ringingAudioRef.current as any).oscillator2) {
          try {
            (ringingAudioRef.current as any).oscillator2.stop();
          } catch (e) {
            // Ignore stop errors
          }
          (ringingAudioRef.current as any).oscillator2 = null;
        }
        
        if ((ringingAudioRef.current as any).audioContext) {
          try {
            (ringingAudioRef.current as any).audioContext.close();
          } catch (e) {
            // Ignore close errors
          }
          (ringingAudioRef.current as any).audioContext = null;
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
        setTimeout(() => {
          try {
            oscillator.stop();
          } catch (e) {
            // Ignore stop errors
          }
        }, 500);
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
        setTimeout(() => {
          try {
            oscillator.stop();
          } catch (e) {
            // Ignore stop errors
          }
        }, 800);
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
