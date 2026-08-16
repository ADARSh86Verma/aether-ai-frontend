import { motion } from 'framer-motion';
import { RiSparkling2Fill } from 'react-icons/ri';
import './AuthLayout.scss';

const FEATURE_LINES = [
  'Context-aware code generation',
  'Instant refactors and explanations',
  'A workspace that remembers your style',
];

export default function AuthLayout({ children, eyebrow, title, subtitle }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__panel auth-layout__panel--brand">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-layout__mark">
            <RiSparkling2Fill />
          </div>
          <h1>Aether</h1>
          <p className="auth-layout__tagline">Your AI coding partner, always in flow.</p>

          <ul className="auth-layout__features">
            {FEATURE_LINES.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
              >
                {line}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="auth-layout__panel auth-layout__panel--form">
        <motion.div
          className="auth-layout__form-card"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {eyebrow && <span className="auth-layout__eyebrow">{eyebrow}</span>}
          {title && <h2>{title}</h2>}
          {subtitle && <p className="auth-layout__subtitle">{subtitle}</p>}
          {children}
        </motion.div>
      </div>
    </div>
  );
}
