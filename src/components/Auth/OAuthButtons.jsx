import { FaGithub, FaGoogle, FaMicrosoft } from 'react-icons/fa';
import './OAuthButtons.scss';

const PROVIDERS = [
  { id: 'google', label: 'Google', icon: <FaGoogle /> },
  { id: 'github', label: 'GitHub', icon: <FaGithub /> },
  { id: 'microsoft', label: 'Microsoft', icon: <FaMicrosoft /> },
];

/**
 * Row of OAuth buttons. `onSelect(providerId)` is called on click —
 * wire this up to real OAuth redirects once the backend exists.
 */
export default function OAuthButtons({ onSelect, loadingProvider }) {
  return (
    <div className="oauth-buttons">
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          className="oauth-buttons__btn"
          onClick={() => onSelect(p.id)}
          disabled={!!loadingProvider}
          aria-label={`Continue with ${p.label}`}
        >
          <span className={`oauth-buttons__icon oauth-buttons__icon--${p.id}`}>{p.icon}</span>
          {loadingProvider === p.id ? 'Connecting…' : `Continue with ${p.label}`}
        </button>
      ))}
    </div>
  );
}
