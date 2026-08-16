import './PasswordStrengthMeter.scss';

/**
 * Scores a password 0-4 based on length and character variety.
 * This is a UI-only heuristic — not a substitute for real backend validation.
 */
export function passwordRequirements(password = '') {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordValid(password = '') {
  const r = passwordRequirements(password);
  return Object.values(r).every(Boolean);
}

export function scorePassword(password) {
  if (!password) return 0;
  let score = 0;
  const r = passwordRequirements(password);
  if (r.minLength) score += 1;
  if (r.uppercase && r.lowercase) score += 1;
  if (r.number) score += 1;
  if (r.symbol) score += 1;
  return Math.min(score, 4);
}

const LABELS = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
const COLORS = ['#fb7185', '#fb923c', '#fbbf24', '#34d399', '#22d3ee'];

export default function PasswordStrengthMeter({ password }) {
  const score = scorePassword(password);
  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="password-strength__bars">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="password-strength__bar"
            style={{ background: i <= score - 1 ? COLORS[score] : undefined }}
          />
        ))}
      </div>
      <span className="password-strength__label" style={{ color: COLORS[score] }}>
        {LABELS[score]}
      </span>
    </div>
  );
}
