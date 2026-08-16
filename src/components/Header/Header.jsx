import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RiAddLine, RiDeleteBin6Line, RiMenuLine, RiSettings4Line, RiSparkling2Fill } from 'react-icons/ri';
import Button from '../Common/Button.jsx';
import ThemeToggle from '../Common/ThemeToggle.jsx';
import Tooltip from '../Common/Tooltip.jsx';
import UserMenu from '../UserMenu/UserMenu.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import './Header.scss';

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate();
  const {
    newChat,
    clearChat,
    activeConversation,
    modelName,
    selectedModel,
    setSelectedModel,
    selectedMode,
    setSelectedMode,
  } = useChat();

  const { showToast } = useToast();

  const handleNewChat = () => {
    newChat();
    showToast('Started a new chat', { type: 'success' });
  };

  const handleClearChat = () => {
    if (!activeConversation) return;
    clearChat();
    showToast('Chat cleared', { type: 'info' });
  };

    const MODELS = [
    {
      id: "qwen3:8b",
      name: "Aether free",
      icon: "🧠",
    },
    {
      id: "deepseek-coder-v2:latest",
      name: "Aether pro",
      icon: "🚀",
    },
  ];

  const MODES = [
  {
    id: "chat",
    name: "Chat",
    icon: "💬",
  },
  {
    id: "search",
    name: "Search",
    icon: "🔍",
  },
  {
    id: "research",
    name: "Research",
    icon: "📚",
  },
];

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button className="app-header__burger" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <RiMenuLine />
        </button>

        <div className="app-header__brand">
          <span className="app-header__logo">
            <RiSparkling2Fill />
          </span>
          <span className="app-header__name">Aether</span>
          <motion.div
            className="app-header__model-picker"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <select
              className="app-header__model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {MODELS.map((model) => (
                <option
                  key={model.id}
                  value={model.id}
                >
                  {model.icon} {model.name}
                </option>
              ))}
            </select>
          </motion.div>
          <motion.div
            className="app-header__mode-picker"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            <select
              className="app-header__mode-select"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
            >
              {MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.icon} {mode.name}
                </option>
              ))}
            </select>
          </motion.div>
        </div>
      </div>

      <div className="app-header__right">
        <Tooltip label="New chat">
          <Button variant="glass" size="sm" icon={<RiAddLine />} onClick={handleNewChat} aria-label="New chat">
            <span className="app-header__btn-text">New chat</span>
          </Button>
        </Tooltip>

        <Tooltip label="Clear chat">
          <Button
            variant="ghost"
            size="sm"
            icon={<RiDeleteBin6Line />}
            onClick={handleClearChat}
            aria-label="Clear chat"
          />
        </Tooltip>

        <ThemeToggle />

        <Tooltip label="Settings">
          <Button variant="icon" onClick={() => navigate('/settings')} aria-label="Open settings">
            <RiSettings4Line />
          </Button>
        </Tooltip>

        <UserMenu />
      </div>
    </header>
  );
}
