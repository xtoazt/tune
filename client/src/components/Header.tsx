import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Settings, Zap, Sparkles, Code } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import APIDocumentation from './APIDocumentation';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { toggleSettings } = useSettings();
  const [showAPIDocs, setShowAPIDocs] = useState(false);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass border-b border-white/20 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg glass hover:bg-white/20 transition-colors"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
            </div>
            <h1 className="text-xl font-bold gradient-text">
              Winded
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg glass"
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Unrestricted AI</span>
          </motion.div>

          <button
            onClick={() => setShowAPIDocs(true)}
            className="p-2 rounded-lg glass hover:bg-white/20 transition-colors"
            title="API Documentation"
          >
            <Code className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={toggleSettings}
            className="p-2 rounded-lg glass hover:bg-white/20 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      
      <APIDocumentation 
        isOpen={showAPIDocs} 
        onClose={() => setShowAPIDocs(false)} 
      />
    </motion.header>
  );
};

export default Header;
