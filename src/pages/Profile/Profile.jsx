import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGithub, FaGoogle, FaMicrosoft } from 'react-icons/fa';
import {
  RiArrowLeftLine,
  RiBillLine,
  RiCameraLine,
  RiChat3Line,
  RiCoinLine,
  RiDeleteBin6Line,
  RiFolder3Line,
  RiKeyboardBoxLine,
  RiKey2Line,
  RiLogoutBoxRLine,
  RiPencilLine,
  RiShieldCheckLine,
  RiStackLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/Common/Button.jsx';
import Modal from '../../components/Common/Modal.jsx';
import Toggle from '../../components/SettingsUI/Toggle.jsx';
import SelectField from '../../components/SettingsUI/SelectField.jsx';
import ApiKeysModal from './ApiKeysModal.jsx';
import BillingModal from './BillingModal.jsx';
import './Profile.scss';

const DEFAULT_SHORTCUTS = [
  { id: 'new-chat', label: 'New chat', combo: 'Ctrl + N' },
  { id: 'toggle-sidebar', label: 'Toggle sidebar', combo: 'Ctrl + B' },
  { id: 'search', label: 'Search conversations', combo: 'Ctrl + K' },
  { id: 'send', label: 'Send message', combo: 'Enter' },
  { id: 'newline', label: 'New line in message', combo: 'Shift + Enter' },
  { id: 'settings', label: 'Open settings', combo: 'Ctrl + ,' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: '日本語' },
];

function StatCard({ icon, label, value }) {
  return (
    <motion.div className="stat-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <span className="stat-card__icon">{icon}</span>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </motion.div>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <section className="profile-card">
      <div className="profile-card__header">
        <h3>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, uploadAvatar, logout, deleteAccount } = useAuth();
  const { settings, updateSection } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const fileInputRef = useRef(null);

  const [shortcuts, setShortcuts] = useState(DEFAULT_SHORTCUTS);
  const [recordingId, setRecordingId] = useState(null);

  const [apiKeysOpen, setApiKeysOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const handleSaveProfile = () => {
    updateUser({ fullName: fullName.trim() || user.fullName, username: username.trim() || user.username });
    setEditing(false);
    showToast('Profile updated', { type: 'success' });
  };

  const handlePickAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file.', { type: 'error' });
      return;
    }
    try {
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
      const updated = await uploadAvatar(file);
      setAvatarPreview(updated.avatarUrl || preview);
      showToast('Profile picture saved', { type: 'success' });
    } catch (error) {
      setAvatarPreview(user.avatarUrl || '');
      showToast(error.response?.data?.detail || 'Could not save profile picture.', { type: 'error' });
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleToggleProvider = (provider) => {
    const connected = user.connectedAccounts[provider];
    updateUser((prev) => ({
      ...prev,
      connectedAccounts: { ...prev.connectedAccounts, [provider]: !connected },
    }));
    showToast(connected ? `Disconnected ${provider}` : `Connected ${provider}`, { type: 'info' });
  };

  const startRecording = (id) => {
    setRecordingId(id);
  };

  const handleRecordKeyDown = (id, e) => {
    e.preventDefault();
    if (e.key === 'Escape') {
      setRecordingId(null);
      return;
    }
    const parts = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.metaKey) parts.push('Cmd');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    if (!['Control', 'Meta', 'Shift', 'Alt'].includes(e.key)) {
      parts.push(key);
      setShortcuts((prev) => prev.map((s) => (s.id === id ? { ...s, combo: parts.join(' + ') } : s)));
      setRecordingId(null);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      showToast('Account deleted', { type: 'info' });
      navigate('/welcome');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/welcome');
  };

  return (
    <div className="profile-page">

      <header className="profile-page__header">
        <button className="profile-page__back" onClick={() => navigate(-1)} aria-label="Back">
          <RiArrowLeftLine />
        </button>
        <h1>My Profile</h1>
      </header>

      <div className="profile-page__body">
        {/* Identity card */}
        <section className="profile-hero">
          <div className="profile-hero__avatar-wrap">
            <div className="profile-hero__avatar">
              {avatarPreview ? <img src={avatarPreview} alt="" /> : <span>{user.fullName?.[0]?.toUpperCase()}</span>}
            </div>
            <button className="profile-hero__camera" onClick={() => fileInputRef.current?.click()} aria-label="Change profile picture">
              <RiCameraLine />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePickAvatar} />
          </div>

          <div className="profile-hero__info">
            {editing ? (
              <div className="profile-hero__edit">
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
                <div className="profile-hero__edit-actions">
                  <Button variant="primary" size="sm" onClick={handleSaveProfile}>
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2>{user.fullName}</h2>
                <p className="profile-hero__username">@{user.username}</p>
                <p className="profile-hero__email">{user.email}</p>
                <span className="profile-hero__role">{user.role}</span>
              </>
            )}
          </div>

          {!editing && (
            <Button variant="glass" size="sm" icon={<RiPencilLine />} onClick={() => setEditing(true)}>
              Edit profile
            </Button>
          )}
        </section>

        {/* Stats */}
        <div className="profile-stats">
          <StatCard icon={<RiChat3Line />} label="Total chats" value={user.stats.totalChats.toLocaleString()} />
          <StatCard icon={<RiFolder3Line />} label="Total projects" value={user.stats.totalProjects.toLocaleString()} />
          <StatCard icon={<RiCoinLine />} label="Total tokens used" value={user.stats.totalTokensUsed.toLocaleString()} />
          <StatCard icon={<RiStackLine />} label="Workspaces" value={user.stats.workspaceCount.toLocaleString()} />
        </div>

        <div className="profile-grid">
          <SectionCard title="Preferences">
            <div className="profile-row">
              <span>Theme</span>
              <Button variant="glass" size="sm" onClick={toggleTheme}>
                {theme === 'dark' ? 'Dark' : 'Light'}
              </Button>
            </div>
            <div className="profile-row">
              <span>Language</span>
              <SelectField
                value={settings.general.language}
                onChange={(v) => updateSection('general', { language: v })}
                options={LANGUAGES}
              />
            </div>
            <button className="profile-card__more" onClick={() => navigate('/settings')}>
              More appearance settings →
            </button>
          </SectionCard>

          <SectionCard title="Notifications">
            <div className="profile-row">
              <span>Desktop notifications</span>
              <Toggle checked={settings.notifications.desktop} onChange={(v) => updateSection('notifications', { desktop: v })} />
            </div>
            <div className="profile-row">
              <span>Sound</span>
              <Toggle checked={settings.notifications.sound} onChange={(v) => updateSection('notifications', { sound: v })} />
            </div>
            <div className="profile-row">
              <span>Email notifications</span>
              <Toggle checked={settings.notifications.email} onChange={(v) => updateSection('notifications', { email: v })} />
            </div>
          </SectionCard>

          <SectionCard title="Connected accounts">
            {[
              { id: 'google', label: 'Google', icon: <FaGoogle /> },
              { id: 'github', label: 'GitHub', icon: <FaGithub /> },
              { id: 'microsoft', label: 'Microsoft', icon: <FaMicrosoft /> },
            ].map((p) => (
              <div className="profile-row" key={p.id}>
                <span className="profile-row__provider">
                  {p.icon} {p.label}
                </span>
                <Button
                  variant={user.connectedAccounts[p.id] ? 'danger' : 'glass'}
                  size="sm"
                  onClick={() => handleToggleProvider(p.id)}
                >
                  {user.connectedAccounts[p.id] ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            ))}
          </SectionCard>

          <SectionCard title="Security">
            <div className="profile-row">
              <span>Two-factor authentication</span>
              <Toggle
                checked={settings.security.twoFactorEnabled}
                onChange={(v) => updateSection('security', { twoFactorEnabled: v })}
              />
            </div>
            <div className="profile-row">
              <span>Password</span>
              <Button variant="glass" size="sm" icon={<RiShieldCheckLine />} onClick={() => navigate('/settings')}>
                Change password
              </Button>
            </div>
            <button className="profile-card__more" onClick={() => navigate('/settings')}>
              More security settings →
            </button>
          </SectionCard>

          <SectionCard title="Keyboard shortcuts" action={<RiKeyboardBoxLine className="profile-card__header-icon" />}>
            {shortcuts.map((s) => (
              <div className="profile-row" key={s.id}>
                <span>{s.label}</span>
                <button
                  className={`shortcut-combo ${recordingId === s.id ? 'is-recording' : ''}`}
                  onClick={() => startRecording(s.id)}
                  onKeyDown={(e) => recordingId === s.id && handleRecordKeyDown(s.id, e)}
                >
                  {recordingId === s.id ? 'Press keys…' : s.combo}
                </button>
              </div>
            ))}
          </SectionCard>

          <SectionCard title="Account & billing">
            <div className="profile-row">
              <span>API keys</span>
              <Button variant="glass" size="sm" icon={<RiKey2Line />} onClick={() => setApiKeysOpen(true)}>
                Manage
              </Button>
            </div>
            <div className="profile-row">
              <span>Billing & plan</span>
              <Button variant="glass" size="sm" icon={<RiBillLine />} onClick={() => setBillingOpen(true)}>
                View
              </Button>
            </div>
          </SectionCard>
        </div>

        {/* Danger zone */}
        <section className="profile-danger">
          <div>
            <h3>Danger zone</h3>
            <p>Log out of your account, or permanently delete it and all associated data.</p>
          </div>
          <div className="profile-danger__actions">
            <Button variant="ghost" size="sm" icon={<RiLogoutBoxRLine />} onClick={handleLogout}>
              Log out
            </Button>
            <Button variant="danger" size="sm" icon={<RiDeleteBin6Line />} onClick={() => setDeleteOpen(true)}>
              Delete account
            </Button>
          </div>
        </section>
      </div>

      <ApiKeysModal open={apiKeysOpen} onClose={() => setApiKeysOpen(false)} />
      <BillingModal open={billingOpen} onClose={() => setBillingOpen(false)} />

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE' || deleting}>
              {deleting ? 'Deleting…' : 'Permanently delete'}
            </Button>
          </>
        }
      >
        <p>
          This will permanently delete your account, chats, and workspaces. This cannot be undone. Type{' '}
          <strong>DELETE</strong> to confirm.
        </p>
        <input
          className="profile-delete-confirm"
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
          placeholder="Type DELETE"
        />
      </Modal>
    </div>
  );
}
