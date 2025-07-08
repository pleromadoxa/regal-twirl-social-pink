
import { useEffect, useRef } from 'react';

export const useCallSounds = () => {
  const ringingAudioRef = useRef<HTMLAudioElement | null>(null);
  const connectAudioRef = useRef<HTMLAudioElement | null>(null);
  const endCallAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio elements for call sounds
    ringingAudioRef.current = new Audio();
    connectAudioRef.current = new Audio();
    endCallAudioRef.current = new Audio();

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
      if (ringingAudioRef.current) {
        ringingAudioRef.current.play().catch(console.error);
      }
    } catch (error) {
      console.error('Error playing ringing sound:', error);
    }
  };

  const stopRinging = () => {
    try {
      if (ringingAudioRef.current) {
        ringingAudioRef.current.pause();
        ringingAudioRef.current.currentTime = 0;
      }
    } catch (error) {
      console.error('Error stopping ringing sound:', error);
    }
  };

  const playConnect = () => {
    try {
      if (connectAudioRef.current) {
        connectAudioRef.current.play().catch(console.error);
      }
    } catch (error) {
      console.error('Error playing connect sound:', error);
    }
  };

  const playEndCall = () => {
    try {
      if (endCallAudioRef.current) {
        endCallAudioRef.current.play().catch(console.error);
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
