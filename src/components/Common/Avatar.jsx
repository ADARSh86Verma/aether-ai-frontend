import { RiSparkling2Fill, RiUser3Fill } from 'react-icons/ri';
import './Avatar.scss';

/**
 * Avatar — renders a gradient-ring AI mark or a user initial circle.
 * @param {'ai'|'user'} type
 * @param {string} name - used to derive initial for user avatars
 */
export default function Avatar({ type = 'ai', name = 'You', size = 34 }) {
  if (type === 'ai') {
    return (
      <span className="avatar avatar--ai" style={{ width: size, height: size }} aria-hidden="true">
        <RiSparkling2Fill />
      </span>
    );
  }

  const initial = name?.trim()?.[0]?.toUpperCase() || <RiUser3Fill />;

  return (
    <span className="avatar avatar--user" style={{ width: size, height: size }} aria-hidden="true">
      {initial}
    </span>
  );
}
