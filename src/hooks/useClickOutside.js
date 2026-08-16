import { useEffect } from 'react';

/**
 * Calls `handler` when a pointer event occurs outside the given ref.
 * @param {React.RefObject<HTMLElement>} ref
 * @param {() => void} handler
 * @param {boolean} active
 */
export function useClickOutside(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;

    function onPointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [ref, handler, active]);
}
