import './Slider.scss';

/**
 * Range slider with a live value readout.
 */
export default function Slider({ label, value, onChange, min = 0, max = 1, step = 0.1, formatValue }) {
  const display = formatValue ? formatValue(value) : value;

  return (
    <div className="slider-field">
      <div className="slider-field__row">
        {label && <span className="slider-field__label">{label}</span>}
        <span className="slider-field__value">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ '--fill': `${((value - min) / (max - min)) * 100}%` }}
      />
    </div>
  );
}
