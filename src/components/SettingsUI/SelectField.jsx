import { useRef, useState } from 'react';
import { RiArrowDownSLine, RiCheckLine } from 'react-icons/ri';
import { useClickOutside } from '../../hooks/useClickOutside.js';
import './SelectField.scss';

/**
 * Lightweight custom select — avoids native <select> styling limits.
 * @param {Array<{value: string, label: string}>} options
 */
export default function SelectField({ label, value, onChange, options, hint }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  const current = options.find((o) => o.value === value);

  return (
    <div className="select-field" ref={ref}>
      {label && <span className="select-field__label">{label}</span>}
      <button
        type="button"
        className={`select-field__trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{current?.label ?? 'Select…'}</span>
        <RiArrowDownSLine />
      </button>

      {open && (
        <ul className="select-field__menu" role="listbox">
          {options.map((opt) => (
            <li key={opt.value} role="option" aria-selected={opt.value === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
                {opt.value === value && <RiCheckLine />}
              </button>
            </li>
          ))}
        </ul>
      )}
      {hint && <span className="select-field__hint">{hint}</span>}
    </div>
  );
}
