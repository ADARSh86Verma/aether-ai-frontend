import { useState } from 'react';
import { RiAddLine, RiDeleteBinLine, RiEyeLine, RiEyeOffLine, RiFileCopyLine, RiKey2Line } from 'react-icons/ri';
import Modal from '../../components/Common/Modal.jsx';
import Button from '../../components/Common/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { generateId } from '../../utils/formatTime.js';
import './ApiKeysModal.scss';

// Dummy in-memory key store for this demo — replace with real API calls
// (e.g. GET/POST/DELETE /account/api-keys) once the backend exists.
const SEED_KEYS = [
  { id: 'k1', name: 'Production', prefix: 'aet_live_', createdAt: '2026-03-02', lastUsed: '2 hours ago' },
  { id: 'k2', name: 'Local dev', prefix: 'aet_test_', createdAt: '2026-05-14', lastUsed: '3 days ago' },
];

function maskKey(prefix) {
  return `${prefix}${'•'.repeat(28)}`;
}

export default function ApiKeysModal({ open, onClose }) {
  const { showToast } = useToast();
  const [keys, setKeys] = useState(SEED_KEYS);
  const [revealedId, setRevealedId] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    setTimeout(() => {
      setKeys((prev) => [
        { id: generateId('key'), name: newKeyName.trim(), prefix: 'aet_live_', createdAt: 'Just now', lastUsed: 'Never' },
        ...prev,
      ]);
      setNewKeyName('');
      setCreating(false);
      showToast('API key created', { type: 'success' });
    }, 600);
  };

  const handleRevoke = (id) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    showToast('API key revoked', { type: 'info' });
  };

  const handleCopy = async (key) => {
    try {
      await navigator.clipboard.writeText(`${key.prefix}${key.id}`);
      showToast('Key copied to clipboard', { type: 'success' });
    } catch {
      // Clipboard unavailable — ignore silently.
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="API Keys" size="lg">
      <div className="api-keys">
        <p className="api-keys__intro">
          Use API keys to authenticate requests to the Aether API from your own applications. Treat them like
          passwords — anyone with a key can act on your behalf.
        </p>

        <div className="api-keys__create">
          <input
            type="text"
            placeholder="Name this key (e.g. Production)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button variant="primary" size="sm" icon={<RiAddLine />} onClick={handleCreate} disabled={creating || !newKeyName.trim()}>
            {creating ? 'Creating…' : 'New key'}
          </Button>
        </div>

        <ul className="api-keys__list">
          {keys.map((key) => (
            <li key={key.id} className="api-keys__item">
              <span className="api-keys__icon">
                <RiKey2Line />
              </span>
              <div className="api-keys__meta">
                <span className="api-keys__name">{key.name}</span>
                <code className="api-keys__value">{revealedId === key.id ? `${key.prefix}${key.id}` : maskKey(key.prefix)}</code>
                <span className="api-keys__dates">
                  Created {key.createdAt} · Last used {key.lastUsed}
                </span>
              </div>
              <div className="api-keys__actions">
                <button onClick={() => setRevealedId(revealedId === key.id ? null : key.id)} aria-label="Toggle key visibility">
                  {revealedId === key.id ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
                <button onClick={() => handleCopy(key)} aria-label="Copy key">
                  <RiFileCopyLine />
                </button>
                <button onClick={() => handleRevoke(key.id)} aria-label="Revoke key" className="is-danger">
                  <RiDeleteBinLine />
                </button>
              </div>
            </li>
          ))}
          {keys.length === 0 && <li className="api-keys__empty">No API keys yet.</li>}
        </ul>
      </div>
    </Modal>
  );
}
