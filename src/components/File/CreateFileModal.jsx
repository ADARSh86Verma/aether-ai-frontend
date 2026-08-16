import { useState } from 'react';
import { RiSparkling2Fill } from 'react-icons/ri';
import Modal from '../Common/Modal.jsx';
import Button from '../Common/Button.jsx';
import { createFileWithAI } from '../../services/fileService';
import './CreateFileModal.scss';

export default function CreateFileModal({ open, onClose, model, onCreated }) {
  const [prompt, setPrompt] = useState('');
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      const result = await createFileWithAI(prompt.trim(), model, filename.trim());
      onCreated?.(result);
      setPrompt('');
      setFilename('');
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Unable to generate the file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create with Aether"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon={<RiSparkling2Fill />} onClick={submit} disabled={loading || !prompt.trim()}>
            {loading ? 'Generating…' : 'Generate file'}
          </Button>
        </>
      }
    >
      <div className="create-file">
        <p className="create-file__hint">Describe what you want. Aether can generate one file or a complete text-based project and return it as a downloadable file/ZIP.</p>
        <label>What should Aether build?</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Create a React login page with Login.jsx and Login.scss…"
          rows={7}
          autoFocus
        />
        <label>Filename (optional)</label>
        <input
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="login.jsx or leave empty for Aether to decide"
        />
        {error && <div className="create-file__error">{error}</div>}
      </div>
    </Modal>
  );
}
