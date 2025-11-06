import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import Composer from './components/Composer';

function App() {
  const { initializeApp } = useStore();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 overflow-hidden relative">
          <ChatArea />
        </main>
        
        <Composer />
      </div>
    </div>
  );
}

export default App;
