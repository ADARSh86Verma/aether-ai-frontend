import { useId, useState } from 'react';
import './Tooltip.scss';

/**
 * Lightweight hover/focus tooltip. Wraps a single child element.
 */
export default function Tooltip({ label, position = 'bottom', children }) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span
      className="tooltip-wrap"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      aria-describedby={id}
    >
      {children}
      <span className={`tooltip tooltip--${position} ${visible ? 'is-visible' : ''}`} role="tooltip" id={id}>
        {label}
      </span>
    </span>
  );
}
