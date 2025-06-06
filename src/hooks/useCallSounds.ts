
import { useRef, useCallback } from 'react';

export const useCallSounds = () => {
  const ringingSoundRef = useRef<HTMLAudioElement | null>(null);
  const endCallSoundRef = useRef<HTMLAudioElement | null>(null);
  const connectSoundRef = useRef<HTMLAudioElement | null>(null);

  // Create audio elements on first use
  const initializeSounds = useCallback(() => {
    if (!ringingSoundRef.current) {
      ringingSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBj6X2vDEciUGK4DO8tiLOAcZaLzs43GhVBMLTaDf9LJiGwo7k9nwyXkpBSF+zfDYizEOE2e48M2WRgIQYrPp6EJPFQY7kdrz1HkpBCJ+z/DanC8Ja7rw0ocFAZwNwV9xNUQmzPD5pV4VBbdUPw/3dQAA');
      ringingSoundRef.current.loop = true;
      ringingSoundRef.current.volume = 0.5;
    }

    if (!endCallSoundRef.current) {
      endCallSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACDhYqFbF1fdJevrJFhNjNgodDbq2EcBj+Z2/LDciUFLIHO8diOOAcYZ7vs55hNEAtRpuLxt2QcBzmR1/LNeSwEI3fH8N+QQQoUXrTp66hUFApGnt/yv2EcBj6X2u/EcycEKYDO8tiLOQcZZ7vs5Y4/ESJgp+LyxHAlBzyP2vLXfSkFQ4nW8tiLOgcYZ7zr5ZhNEAy+VksG8ZAAB9iJOgYZZ7ru5ZhNEBAZZ7zt5ZhNEBAZaLzu5ZhNEBIW5');
      endCallSoundRef.current.volume = 0.7;
    }

    if (!connectSoundRef.current) {
      connectSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm20IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAGBhYqFbF1fdJCvrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt5p');
      connectSoundRef.current.volume = 0.6;
    }
  }, []);

  const playRinging = useCallback(() => {
    initializeSounds();
    if (ringingSoundRef.current) {
      ringingSoundRef.current.currentTime = 0;
      ringingSoundRef.current.play().catch(console.error);
    }
  }, [initializeSounds]);

  const stopRinging = useCallback(() => {
    if (ringingSoundRef.current) {
      ringingSoundRef.current.pause();
      ringingSoundRef.current.currentTime = 0;
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
