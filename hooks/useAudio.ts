import { useMemo, useCallback, useState, useEffect } from 'react';

interface AudioOptions {
  loop?: boolean;
  volume?: number;
}

const useAudio = (url: string, options: AudioOptions = {}) => {
  const { loop = false, volume = 1.0 } = options;
  
  // A single audio instance for looping music, managed by useMemo.
  // This instance is only created for looping audio to avoid creating
  // unnecessary elements for one-shot sound effects.
  const audio = useMemo(() => {
    if (loop) {
        const instance = new Audio(url);
        instance.loop = loop;
        return instance;
    }
    return null;
  }, [url, loop]);
  
  const [isPlaying, setIsPlaying] = useState(false);

  // Effect to control playback for the single looping audio instance.
  // This reacts to the isPlaying state.
  useEffect(() => {
    if (loop && audio) {
      audio.volume = volume; // Allow volume to be updated dynamically
      if (isPlaying) {
        audio.play().catch(e => console.error("Looping audio play failed:", e));
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, loop, audio, volume]);

  // Effect for cleanup on unmount.
  useEffect(() => {
    return () => {
      audio?.pause();
    };
  }, [audio]);

  const play = useCallback(() => {
    if (loop) {
      // For looping sounds, we just manage the state. The useEffect handles playback.
      setIsPlaying(true);
    } else {
      // For non-looping SFX, create a new Audio object on demand.
      // This allows for multiple, overlapping instances of the same sound.
      const sfx = new Audio(url);
      sfx.volume = volume;
      sfx.play().catch(e => console.error("SFX play failed:", e));
    }
  }, [loop, url, volume]);

  const stop = useCallback(() => {
    if (loop) {
      // For looping sounds, we manage state and reset playback time.
      setIsPlaying(false);
      if (audio) {
          audio.currentTime = 0;
      }
    }
    // 'stop' is a no-op for fire-and-forget SFX.
  }, [loop, audio]);
  
  const toggle = useCallback(() => {
    if (loop) {
      setIsPlaying(p => !p);
    }
  }, [loop]);

  // Return the original contract to avoid breaking consuming components.
  return { playing: isPlaying, play, stop, toggle };
};

export default useAudio;
