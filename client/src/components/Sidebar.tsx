import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Trash2, Plus, Zap, Settings } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { state, currentSession, setCurrentSession, deleteSession, createSession } = useChat();
  const { state: settingsState } = useSettings();

  const handleNewSession = () => {
    createSession('New Chat', settingsState.settings.model, settingsState.settings.systemMessage);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          x: isOpen ? 0 : -320,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed left-0 top-0 h-full w-80 thunder-bg border-r border-gray-800 z-50 lg:relative lg:translate-x-0 lg:opacity-100 gaming-grid`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center gaming-glow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black thunder-logo">THUNDER</h1>
                <p className="text-sm text-gray-400">AI Assistant</p>
              </div>
            </div>
            
            <button
              onClick={handleNewSession}
              className="w-full thunder-button thunder-button-primary flex items-center justify-center space-x-2 gaming-glow"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {state.sessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl thunder-card mx-auto mb-4 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 text-sm">No conversations yet</p>
                <p className="text-gray-500 text-xs mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              state.sessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`sidebar-card ${
                    currentSession?.id === session.id ? 'active' : ''
                  }`}
                  onClick={() => setCurrentSession(session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <h3 className="text-sm font-semibold text-white truncate">
                          {session.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>{session.messages.length} messages</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(session.updatedAt, { addSuffix: true })}</span>
                      </div>
                      
                      {session.model && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-800 text-gray-300 border border-gray-600">
                            {session.model}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-2 rounded-lg hover:bg-gray-800 transition-colors ml-2"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-3 p-4 rounded-xl thunder-card">
              <div className="w-3 h-3 rounded-full bg-green-500 status-online"></div>
              <span className="text-sm text-gray-300 font-medium">Thunder Mode Active</span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;