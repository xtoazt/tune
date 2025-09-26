import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Menu, X } from 'lucide-react';
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
        <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-700">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="text-white font-semibold">Winded</span>
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
              background: '#1f2937',
              color: '#ffffff',
              border: '1px solid #374151',
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