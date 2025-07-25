
import { useState, useEffect, useRef } from 'react';

interface UseIdleOptions {
  onIdle: () => void;
  idleTime?: number; // in seconds
}

export const useIdle = ({ onIdle, idleTime = 60 }: UseIdleOptions) => {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout>();

  const resetTimer = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    setIsIdle(false);
    timeoutId.current = setTimeout(() => {
      setIsIdle(true);
      onIdle();
    }, idleTime * 1000);
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

    const handleEvent = () => {
      resetTimer();
    };

    events.forEach(event => window.addEventListener(event, handleEvent));
    
    // Initial timer start
    resetTimer();

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      events.forEach(event => window.removeEventListener(event, handleEvent));
    };
  }, [idleTime, onIdle]);

  return isIdle;
};
