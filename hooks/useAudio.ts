import { useMemo, useCallback, useState, useEffect } from 'react';

interface AudioOptions {
  loop?: boolean;
  volume?: number;
}

const useAudio = (url: string, options: AudioOptions = {}) => {
  const { loop = false, volume = 1.0 } = options;

  const audio = useMemo(() => {
    const instance = new Audio(url);
    instance.loop = loop;
    instance.volume = volume;
    return instance;
  }, [url, loop, volume]);
  
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(() => {
    if (loop) {
      setIsPlaying(true);
    } else {
      audio.currentTime = 0;
      audio.play().catch(e => console.error("Audio play failed:", e));
    }
  }, [audio, loop]);

  const stop = useCallback(() => {
    if (loop) {
      setIsPlaying(false);
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [audio, loop]);
  
  useEffect(() => {
    if (loop) {
      if (isPlaying) {
        audio.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, [isPlaying, loop, audio]);
  
  useEffect(() => {
    return () => {
      audio.pause();
    };
  }, [audio]);

  const toggle = useCallback(() => {
    if (loop) {
      setIsPlaying(p => !p);
    }
  }, [loop]);

  return { playing: isPlaying, play, stop, toggle };
};

export default useAudio;
