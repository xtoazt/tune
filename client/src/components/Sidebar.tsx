import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Settings, 
  Bot, 
  User,
  Clock,
  Zap
} from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { state, currentSession, createSession, setCurrentSession, deleteSession } = useChat();
  const { state: settingsState, toggleSettings } = useSettings();
  const [newSessionTitle, setNewSessionTitle] = useState('');

  const handleCreateSession = () => {
    if (newSessionTitle.trim()) {
      createSession(newSessionTitle.trim(), settingsState.settings.model, settingsState.settings.systemMessage);
      setNewSessionTitle('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateSession();
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Chat Sessions</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* New Session Input */}
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="New session title..."
              className="warmwind-input flex-1 px-3 py-2"
            />
            <button
              onClick={handleCreateSession}
              disabled={!newSessionTitle.trim()}
              className="warmwind-button-primary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {state.sessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                currentSession?.id === session.id
                  ? 'bg-gray-100 border border-gray-300'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
              onClick={() => setCurrentSession(session.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <h3 className="text-sm font-medium text-gray-800 truncate">
                      {session.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Bot className="w-3 h-3" />
                      <span>{session.model}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(session.updatedAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                  
                  <div className="mt-1 text-xs text-gray-500">
                    {session.messages.length} messages
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="p-1 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {state.sessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No chat sessions yet</p>
            <p className="text-gray-400 text-xs mt-1">Create your first session to get started</p>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={toggleSettings}
          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
          <span className="text-gray-800 font-medium">Settings</span>
        </button>
        
        <div className="mt-3 p-3 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">AI Status</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-600">Tunable Mode Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
