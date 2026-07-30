import { useRef, useCallback } from "react";

export default function useThrottle(fn, delay = 100) {
  const lastCallRef = useRef(0);

  return useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        fn(...args);
      }
    },
    [fn, delay]
  );
}
