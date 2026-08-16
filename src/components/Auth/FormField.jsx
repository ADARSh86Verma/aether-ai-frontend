import './FormField.scss';

/**
 * Wraps a label + input/children + inline error message.
 */
export default function FormField({ label, htmlFor, error, hint, children, required }) {
  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={htmlFor}>
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="form-field__error">{error}</span>
      ) : (
        hint && <span className="form-field__hint">{hint}</span>
      )}
    </div>
  );
}
