import { useLayoutEffect } from 'react';

/**
 * Auto-resizes a textarea to fit its content, up to a max height.
 * @param {React.RefObject<HTMLTextAreaElement>} ref
 * @param {string} value - current textarea value (dependency for resize)
 * @param {number} maxHeight - px cap before scrolling kicks in
 */
export function useAutoResize(ref, value, maxHeight = 200) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [ref, value, maxHeight]);
}
