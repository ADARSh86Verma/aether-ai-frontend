import { motion } from 'framer-motion';
import { RiCheckLine, RiFileCopyLine, RiRestartLine } from 'react-icons/ri';
import { useState } from 'react';
import Avatar from '../Common/Avatar.jsx';
import MarkdownRenderer from './MarkdownRenderer.jsx';
import TypingAnimation from './TypingAnimation.jsx';
import { formatTimestamp } from '../../utils/formatTime.js';
import './MessageBubble.scss';
import FileCard from '../File/FileCard.jsx';

export default function MessageBubble({ message, isThinking, onRegenerate, canRegenerate }) {
  const [copied, setCopied] = useState(false);

  if (!message) {
    return null;
  }

  const isUser = message.role === 'user';
  const attachments = Array.isArray(message.attachments)
    ? message.attachments.filter(Boolean)
    : [];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable — silently ignore.
    }
  };

  return (
    <motion.div
      className={`message-row ${isUser ? 'is-user' : 'is-ai'}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Avatar type={isUser ? 'user' : 'ai'} />

      <div className="message-row__content">
        <div className="message-row__meta">
          <span className="message-row__name">{isUser ? 'You' : 'Aether'}</span>
          <span className="message-row__time">{formatTimestamp(message.createdAt)}</span>
        </div>

        {attachments.length > 0 && (
          <div className="message-row__attachments">
            {attachments.map((file, index) => (
              <FileCard
                key={file.id || `${file.filename || "file"}-${index}`}
                file={file}
                compact
              />
            ))}
          </div>
        )}

        <div className="message-row__bubble">
          {isThinking ? (
            <TypingAnimation />
          ) : isUser ? (
            <p className="message-row__plain">{message.content}</p>
          ) : (
            <>
              <MarkdownRenderer content={message.content || ' '} />
              {message.streaming && <span className="message-row__caret" aria-hidden="true" />}
            </>
          )}
        </div>

        {!isUser && !message.streaming && !isThinking && (
          <div className="message-row__actions">
            <button onClick={handleCopy} aria-label="Copy response">
              {copied ? <RiCheckLine /> : <RiFileCopyLine />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {canRegenerate && (
              <button onClick={onRegenerate} aria-label="Regenerate response">
                <RiRestartLine />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
