import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  RiBookOpenLine,
  RiKeyboardBoxLine,
  RiLifebuoyLine,
  RiLogoutBoxRLine,
  RiSettings4Line,
  RiStackLine,
  RiUser3Line,
} from 'react-icons/ri';
import Avatar from '../Common/Avatar.jsx';
import Modal from '../Common/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useClickOutside } from '../../hooks/useClickOutside.js';
import './UserMenu.scss';

const SHORTCUTS = [
  { label: 'New chat', combo: 'Ctrl + N' },
  { label: 'Toggle sidebar', combo: 'Ctrl + B' },
  { label: 'Search conversations', combo: 'Ctrl + K' },
  { label: 'Send message', combo: 'Enter' },
  { label: 'New line in message', combo: 'Shift + Enter' },
  { label: 'Open settings', combo: 'Ctrl + ,' },
];

const WORKSPACES = ['Personal', 'Team', 'Client Work'];

export default function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  if (!user) return null;

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/welcome');
  };

  const ITEMS = [
    { icon: <RiUser3Line />, label: 'My Profile', onClick: () => go('/profile') },
    { icon: <RiStackLine />, label: 'Workspace', onClick: () => setWorkspaceOpen(true) },
    { icon: <RiSettings4Line />, label: 'Settings', onClick: () => go('/settings') },
    { icon: <RiKeyboardBoxLine />, label: 'Keyboard Shortcuts', onClick: () => setShortcutsOpen(true) },
    { icon: <RiLifebuoyLine />, label: 'Help', onClick: () => showToast('Help center is coming soon', { type: 'info' }) },
    { icon: <RiBookOpenLine />, label: 'Documentation', onClick: () => showToast('Documentation is coming soon', { type: 'info' }) },
  ];

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-menu__trigger" onClick={() => setOpen((v) => !v)} aria-label="Open user menu" aria-expanded={open}>
        <Avatar type="user" name={user.fullName} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="user-menu__panel"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="user-menu__identity">
              <Avatar type="user" name={user.fullName} size={40} />
              <div>
                <span className="user-menu__name">{user.fullName}</span>
                <span className="user-menu__email">{user.email}</span>
              </div>
            </div>

            <div className="user-menu__list">
              {ITEMS.map((item) => (
                <button key={item.label} className="user-menu__item" onClick={item.onClick}>
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="user-menu__divider" />

            <button className="user-menu__item user-menu__item--danger" onClick={handleLogout}>
              <span>
                <RiLogoutBoxRLine />
              </span>
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} title="Keyboard Shortcuts">
        <ul className="user-menu__shortcuts">
          {SHORTCUTS.map((s) => (
            <li key={s.label}>
              <span>{s.label}</span>
              <code>{s.combo}</code>
            </li>
          ))}
        </ul>
      </Modal>

      <Modal open={workspaceOpen} onClose={() => setWorkspaceOpen(false)} title="Switch workspace">
        <ul className="user-menu__workspaces">
          {WORKSPACES.map((w) => (
            <li key={w}>
              <button
                onClick={() => {
                  setWorkspaceOpen(false);
                  showToast(`Switched to ${w}`, { type: 'success' });
                }}
              >
                {w}
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}
