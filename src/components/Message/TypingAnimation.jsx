import './TypingAnimation.scss';

/**
 * Three-dot "thinking" indicator shown before streaming begins.
 */
export default function TypingAnimation({ label = 'Aether is thinking' }) {
  return (
    <div className="typing-animation" role="status" aria-label={label}>
      <span className="typing-animation__dot" />
      <span className="typing-animation__dot" />
      <span className="typing-animation__dot" />
    </div>
  );
}
