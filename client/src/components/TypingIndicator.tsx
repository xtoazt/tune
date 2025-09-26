import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start space-x-4">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-2xl thunder-card border border-gray-700 flex items-center justify-center flex-shrink-0">
        <Zap className="w-6 h-6 text-indigo-400" />
      </div>

      {/* Typing Indicator */}
      <div className="flex-1">
        <div className="thunder-card border border-gray-700 rounded-2xl rounded-bl-md p-6">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-sm font-bold text-white">Thunder</span>
            <span className="text-xs text-gray-400">is typing</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="typing-indicator"></div>
            <div className="typing-indicator"></div>
            <div className="typing-indicator"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;