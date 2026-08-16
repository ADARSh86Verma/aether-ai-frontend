import { RiCloseLine, RiSearchLine } from 'react-icons/ri';
import './SearchBar.scss';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="search-bar">
      <RiSearchLine className="search-bar__icon" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button className="search-bar__clear" onClick={() => onChange('')} aria-label="Clear search">
          <RiCloseLine />
        </button>
      )}
    </div>
  );
}
