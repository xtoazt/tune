import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Menu, X, Zap } from 'lucide-react';
import { ChatProvider } from './contexts/ChatContext';
import { SettingsProvider } from './contexts/SettingsContext';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <SettingsProvider>
      <ChatProvider>
        <div className="h-screen thunder-bg gaming-grid flex">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-800">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center gaming-glow">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg thunder-logo">THUNDER</span>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 flex flex-col min-h-0">
              <ChatInterface />
            </div>
          </div>
        </div>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#ffffff',
              border: '1px solid #333333',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </ChatProvider>
    </SettingsProvider>
  );
}

export default App;