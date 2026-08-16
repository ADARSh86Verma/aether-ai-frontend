import { useState } from 'react';
import Header from '../../components/Header/Header.jsx';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';
import ChatContainer from '../../components/Chat/ChatContainer.jsx';
import './Home.scss';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className="app-shell__body">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <ChatContainer />
      </div>
    </div>
  );
}
