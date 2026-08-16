import './SettingRow.scss';

/**
 * A single settings row: title + optional description on the left,
 * arbitrary control on the right (or full-width below on mobile).
 */
export default function SettingRow({ title, description, children, stack }) {
  return (
    <div className={`setting-row ${stack ? 'setting-row--stack' : ''}`}>
      <div className="setting-row__text">
        <span className="setting-row__title">{title}</span>
        {description && <span className="setting-row__desc">{description}</span>}
      </div>
      <div className="setting-row__control">{children}</div>
    </div>
  );
}
