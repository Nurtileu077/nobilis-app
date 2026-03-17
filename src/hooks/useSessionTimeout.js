import { useEffect, useRef, useCallback } from 'react';

const DEFAULT_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE = 5 * 60 * 1000; // 5 minutes before timeout

/**
 * Auto-logout after inactivity
 * @param {Function} onLogout - logout handler
 * @param {Function} onWarning - warning callback (optional)
 * @param {number} timeout - timeout in ms (default 30 min)
 */
export default function useSessionTimeout(onLogout, onWarning, timeout = DEFAULT_TIMEOUT) {
  const timerRef = useRef(null);
  const warningRef = useRef(null);
  const lastActivity = useRef(Date.now());

  const resetTimer = useCallback(() => {
    lastActivity.current = Date.now();

    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Set warning timer
    if (onWarning && timeout > WARNING_BEFORE) {
      warningRef.current = setTimeout(() => {
        onWarning(Math.ceil(WARNING_BEFORE / 60000));
      }, timeout - WARNING_BEFORE);
    }

    // Set logout timer
    timerRef.current = setTimeout(() => {
      onLogout();
    }, timeout);
  }, [onLogout, onWarning, timeout]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

    const handleActivity = () => {
      // Throttle: only reset if more than 30s since last activity
      if (Date.now() - lastActivity.current > 30000) {
        resetTimer();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [resetTimer]);

  return { resetTimer };
}
