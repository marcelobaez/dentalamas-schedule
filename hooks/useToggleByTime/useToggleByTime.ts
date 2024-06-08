import { useEffect, useState } from 'react';

export function useToggleByTime(duration: number = 4000) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      // Cleanup the timer on unmount or when duration changes
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const showElement = () => setIsVisible(true);

  return [isVisible, showElement] as const;
}
