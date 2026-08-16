import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  RiAddLine,
  RiChatNewLine,
  RiCloseLine,
  RiSettings4Line,
  RiUser3Line,
} from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../Common/SearchBar.jsx';
import Button from '../Common/Button.jsx';
import ConversationItem from './ConversationItem.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import './Sidebar.scss';

const MODES = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'search', label: 'Search', icon: '🔎' },
  { id: 'research', label: 'Research', icon: '📚' },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    conversations,
    activeId,
    openChat,
    newChat,
    selectedMode,
    setSelectedMode,
  } = useChat();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, query]);

  const favorites = filtered.filter((c) => c.favorite);
  const recents = filtered.filter((c) => !c.favorite);

  const handleSelect = async (id) => {
    await openChat(id);
    onClose?.();
  };

  const handleNewChat = async () => {
    await newChat();
    onClose?.();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="sidebar-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Conversation sidebar">
        <div className="sidebar__mobile-header">
          <div className="sidebar__mobile-brand">
            <span className="sidebar__mobile-logo">✦</span>
            <div>
              <strong>Aether</strong>
              <span>AI workspace</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar__close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <RiCloseLine />
          </button>
        </div>

        <div className="sidebar__top">
          <Button
            variant="primary"
            size="md"
            icon={<RiAddLine />}
            className="sidebar__new-chat"
            onClick={handleNewChat}
          >
            New chat
          </Button>

          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search conversations"
          />

          <div className="sidebar__mode-picker">
            <span className="sidebar__mode-label">Mode</span>
            <div className="sidebar__mode-list">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={selectedMode === mode.id ? 'is-active' : ''}
                  onClick={() => setSelectedMode(mode.id)}
                >
                  <span>{mode.icon}</span>
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar__scroll">
          {favorites.length > 0 && (
            <section className="sidebar__section">
              <h4>Favorites</h4>
              <ul>
                {favorites.map((c) => (
                  <ConversationItem
                    key={c.id}
                    conversation={c}
                    active={c.id === activeId}
                    onSelect={handleSelect}
                  />
                ))}
              </ul>
            </section>
          )}

          <section className="sidebar__section">
            <h4>Recent</h4>
            {recents.length === 0 ? (
              <div className="sidebar__empty">
                <RiChatNewLine />
                <p>No conversations found</p>
              </div>
            ) : (
              <ul>
                {recents.map((c) => (
                  <ConversationItem
                    key={c.id}
                    conversation={c}
                    active={c.id === activeId}
                    onSelect={handleSelect}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="sidebar__account">
          <div className="sidebar__account-user">
            <span className="sidebar__account-avatar">
              {user?.fullName?.[0]?.toUpperCase() || 'A'}
            </span>
            <div>
              <strong>{user?.fullName || 'Aether User'}</strong>
              <span>{user?.email || 'Account'}</span>
            </div>
          </div>

          <div className="sidebar__account-actions">
            <button type="button" onClick={() => { navigate('/profile'); onClose?.(); }}>
              <RiUser3Line />
              Profile
            </button>
            <button type="button" onClick={() => { navigate('/settings'); onClose?.(); }}>
              <RiSettings4Line />
              Settings
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
