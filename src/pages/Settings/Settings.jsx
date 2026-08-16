import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiArrowLeftLine,
  RiFolderSettingsLine,
  RiInformationLine,
  RiNotification3Line,
  RiPaletteLine,
  RiRobot2Line,
  RiShieldKeyholeLine,
  RiTerminalBoxLine,
  RiCodeBoxLine,
} from 'react-icons/ri';
import {
  GeneralPanel,
  AiPanel,
  WorkspacePanel,
  EditorPanel,
  TerminalPanel,
  NotificationsPanel,
  SecurityPanel,
  AboutPanel,
} from './SettingsPanels.jsx';
import './Settings.scss';

const TABS = [
  { id: 'general', label: 'General', icon: <RiPaletteLine />, Panel: GeneralPanel },
  { id: 'ai', label: 'AI Settings', icon: <RiRobot2Line />, Panel: AiPanel },
  { id: 'workspace', label: 'Workspace', icon: <RiFolderSettingsLine />, Panel: WorkspacePanel },
  { id: 'editor', label: 'Editor', icon: <RiCodeBoxLine />, Panel: EditorPanel },
  { id: 'terminal', label: 'Terminal', icon: <RiTerminalBoxLine />, Panel: TerminalPanel },
  { id: 'notifications', label: 'Notifications', icon: <RiNotification3Line />, Panel: NotificationsPanel },
  { id: 'security', label: 'Security', icon: <RiShieldKeyholeLine />, Panel: SecurityPanel },
  { id: 'about', label: 'About', icon: <RiInformationLine />, Panel: AboutPanel },
];

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const ActivePanel = TABS.find((t) => t.id === activeTab)?.Panel ?? GeneralPanel;

  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <button className="settings-page__back" onClick={() => navigate(-1)} aria-label="Back">
          <RiArrowLeftLine />
        </button>
        <h1>Settings</h1>
      </header>

      <div className="settings-page__body">
        <nav className="settings-page__nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`settings-page__tab ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="settings-page__tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <motion.div
          key={activeTab}
          className="settings-page__panel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <ActivePanel />
        </motion.div>
      </div>
    </div>
  );
}
