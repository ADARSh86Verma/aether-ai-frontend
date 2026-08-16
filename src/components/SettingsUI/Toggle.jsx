import './Toggle.scss';

/**
 * Accessible on/off switch. Controlled component.
 */
export default function Toggle({ checked, onChange, label, disabled }) {
  return (
    <label className={`toggle ${disabled ? 'is-disabled' : ''}`}>
      {label && <span className="toggle__label">{label}</span>}
      <span className="toggle__track">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle__thumb" />
      </span>
    </label>
  );
}
