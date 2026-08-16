import { forwardRef } from 'react';
import './Button.scss';

/**
 * Reusable button. Variants: 'primary' | 'ghost' | 'glass' | 'danger' | 'icon'
 */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', icon, iconPosition = 'left', className = '', children, ...rest },
  ref
) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, className].filter(Boolean).join(' ');

  return (
    <button ref={ref} className={classes} {...rest}>
      {icon && iconPosition === 'left' && <span className="btn__icon">{icon}</span>}
      {children && <span className="btn__label">{children}</span>}
      {icon && iconPosition === 'right' && <span className="btn__icon">{icon}</span>}
    </button>
  );
});

export default Button;
