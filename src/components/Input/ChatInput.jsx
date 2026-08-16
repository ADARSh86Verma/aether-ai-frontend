import { useRef, useState } from 'react';
import {
  RiAddLine,
  RiSendPlaneFill,
  RiMicFill,
  RiStopCircleFill,
  RiLoader4Line,
  RiCloseLine,
} from 'react-icons/ri';

import useSpeechRecognition from '../../hooks/useSpeechRecognition.js';
import { useAutoResize } from '../../hooks/useAutoResize.js';
import { uploadFile } from '../../services/fileService';
import FileCard from '../File/FileCard.jsx';
import './ChatInput.scss';

const MAX_CHARS = 4000;

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useAutoResize(textareaRef, value);

  const {
    listening,
    processing,
    supported,
    error: speechError,
    startListening,
    stopListening,
  } = useSpeechRecognition({ language: 'hi-IN' });

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if ((!trimmed && attachments.length === 0) || disabled || uploading) return;

    const files = attachments.filter(Boolean);
    onSend(trimmed || 'Please analyze the attached file(s).', files);
    setValue('');
    setAttachments([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoice = () => {
    if (disabled || processing) return;
    if (!supported) return;
    if (listening) {
      stopListening();
      return;
    }
    startListening((text) => {
      if (!text?.trim()) return;
      setValue((previous) => {
        const separator = previous && !previous.endsWith(' ') ? ' ' : '';
        return (previous + separator + text.trim()).slice(0, MAX_CHARS);
      });
    });
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files.slice(0, 5)) {
        const result = await uploadFile(file);
        uploaded.push(result);
      }
      setAttachments((current) => [...current, ...uploaded]);
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (id) => {
    setAttachments((current) => current.filter((file) => file.id !== id));
  };

  const nearLimit = value.length > MAX_CHARS * 0.9;

  return (
    <div className={`chat-input ${disabled ? 'is-disabled' : ''}`}>
      {attachments.length > 0 && (
        <div className="chat-input__attachments">
          {attachments.map((file) => (
            <div key={file.id} className="chat-input__attachment">
              <FileCard file={file} compact />
              <button
                type="button"
                className="chat-input__attachment-remove"
                onClick={() => removeAttachment(file.id)}
                aria-label={`Remove ${file.filename}`}
              >
                <RiCloseLine />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="chat-input__upload-status">
          <RiLoader4Line className="chat-input__spin" /> Uploading file…
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        maxLength={MAX_CHARS}
        placeholder={disabled ? 'Aether is responding…' : 'Message Aether — Shift+Enter for a new line'}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        aria-label="Message Aether"
      />

      {processing && <div className="chat-input__speech-status">Transcribing voice…</div>}
      {speechError && <div className="chat-input__speech-error">{speechError}</div>}

      <div className="chat-input__row">
        <div className="chat-input__left-actions">
          <input
            ref={fileInputRef}
            type="file"
            hidden
            multiple
            onChange={handleFileChange}
            accept=".pdf,.docx,.xlsx,.xlsm,.csv,.txt,.md,.json,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.h,.css,.scss,.html,.xml,.yml,.yaml,.sql,.zip,.png,.jpg,.jpeg,.webp,.gif"
          />
          <button
            type="button"
            className="chat-input__attach"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            aria-label="Attach files"
            title="Attach files"
          >
            <RiAddLine />
          </button>
          <span className={`chat-input__counter ${nearLimit ? 'is-warning' : ''}`}>
            {value.length}/{MAX_CHARS}
          </span>
        </div>

        <div className="chat-input__right-actions">
          <button
            type="button"
            className={`chat-input__mic ${listening ? 'is-listening' : ''}`}
            onClick={handleVoice}
            disabled={disabled || processing || !supported}
            aria-label={listening ? 'Stop voice input' : 'Start voice input'}
          >
            {processing ? <RiLoader4Line className="chat-input__spin" /> : listening ? <RiStopCircleFill /> : <RiMicFill />}
          </button>

          <button
            type="button"
            className="chat-input__send"
            onClick={handleSubmit}
            disabled={disabled || uploading || (!value.trim() && attachments.length === 0)}
            aria-label="Send message"
          >
            <RiSendPlaneFill />
          </button>
        </div>
      </div>
    </div>
  );
}
