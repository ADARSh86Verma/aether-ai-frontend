import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiMessage3Line,
  RiPencilLine,
  RiStarFill,
  RiStarLine,
} from 'react-icons/ri';
import Modal from '../Common/Modal.jsx';
import Button from '../Common/Button.jsx';
import Tooltip from '../Common/Tooltip.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatRelative } from '../../utils/formatTime.js';

export default function ConversationItem({ conversation, active, onSelect }) {
  const { renameChat, deleteChat, toggleFavorite } = useChat();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(conversation.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef(null);

  const startEditing = (e) => {
    e.stopPropagation();
    setDraftTitle(conversation.title);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commitRename = () => {
    const trimmed = draftTitle.trim();
    if (trimmed) renameChat(conversation.id, trimmed);
    setEditing(false);
  };

  const handleDelete = () => {
    deleteChat(conversation.id);
    setConfirmDelete(false);
    showToast('Chat deleted', { type: 'info' });
  };

  return (
    <>
      <motion.li
        layout
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className={`conversation-item ${active ? 'is-active' : ''}`}
        onClick={() => !editing && onSelect(conversation.id)}
      >
        <span className="conversation-item__icon">
          <RiMessage3Line />
        </span>

        {editing ? (
          <div className="conversation-item__edit" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') setEditing(false);
              }}
            />
            <button onClick={commitRename} aria-label="Save name">
              <RiCheckLine />
            </button>
            <button onClick={() => setEditing(false)} aria-label="Cancel rename">
              <RiCloseLine />
            </button>
          </div>
        ) : (
          <div className="conversation-item__body">
            <span className="conversation-item__title">{conversation.title}</span>
            <span className="conversation-item__time">{formatRelative(conversation.updatedAt)}</span>
          </div>
        )}

        {!editing && (
          <div className="conversation-item__actions">
            <Tooltip label={conversation.favorite ? 'Unfavorite' : 'Favorite'}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(conversation.id);
                }}
                aria-label="Toggle favorite"
              >
                {conversation.favorite ? <RiStarFill className="is-fav" /> : <RiStarLine />}
              </button>
            </Tooltip>
            <Tooltip label="Rename">
              <button onClick={startEditing} aria-label="Rename chat">
                <RiPencilLine />
              </button>
            </Tooltip>
            <Tooltip label="Delete">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(true);
                }}
                aria-label="Delete chat"
              >
                <RiDeleteBinLine />
              </button>
            </Tooltip>
          </div>
        )}
      </motion.li>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this chat?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p>“{conversation.title}” and its messages will be permanently removed. This can’t be undone.</p>
      </Modal>
    </>
  );
}
