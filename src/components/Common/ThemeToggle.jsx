import { RiMoonClearFill, RiSunFill } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext.jsx';
import Tooltip from './Tooltip.jsx';
import './ThemeToggle.scss';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Tooltip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle color theme"
        aria-pressed={!isDark}
      >
        <span className={`theme-toggle__thumb ${isDark ? '' : 'is-light'}`}>
          {isDark ? <RiMoonClearFill /> : <RiSunFill />}
        </span>
      </button>
    </Tooltip>
  );
}
