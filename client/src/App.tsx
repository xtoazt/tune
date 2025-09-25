import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import APIDocumentation from './components/APIDocumentation';
import { ChatProvider } from './contexts/ChatContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiDocsOpen, setApiDocsOpen] = useState(false);
  const { state: settingsState } = useSettings();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-semibold text-gray-800">winded</span>
            </div>
          </div>

          {/* Center Title */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-medium text-gray-800">Tunable AI Assistant</h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setApiDocsOpen(true)}
              className="warmwind-button px-4 py-2 text-sm"
            >
              API Docs
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="warmwind-button px-4 py-2 text-sm"
            >
              Sessions
            </button>
            <button
              onClick={() => settingsState.dispatch({ type: 'SET_SETTINGS_OPEN', payload: true })}
              className="warmwind-button px-4 py-2 text-sm"
            >
              Settings
            </button>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <ChatInterface />
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black bg-opacity-25"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 w-96 bg-white border-r border-gray-200 shadow-xl"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <SettingsModal 
        isOpen={settingsState.isSettingsOpen} 
        onClose={() => settingsState.dispatch({ type: 'SET_SETTINGS_OPEN', payload: false })} 
      />
      
      <APIDocumentation 
        isOpen={apiDocsOpen} 
        onClose={() => setApiDocsOpen(false)} 
      />
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#2d3748',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </SettingsProvider>
  );
}

export default App;
