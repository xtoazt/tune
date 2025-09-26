import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start space-x-4">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 flex items-center justify-center flex-shrink-0">
        <Bot className="w-5 h-5 text-white" />
      </div>

      {/* Typing Indicator */}
      <div className="flex-1">
        <div className="bg-gray-700 border border-gray-600 rounded-2xl rounded-bl-md p-6">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-sm font-semibold text-white">Winded</span>
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