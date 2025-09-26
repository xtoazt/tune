import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Bot, Zap, Sliders } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { state, updateSettings } = useSettings();

  const handleInputChange = (field: string, value: any) => {
    updateSettings({ [field]: value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="settings-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="settings-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Settings</h2>
                  <p className="text-gray-400">Customize your AI experience</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Model Selection */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Bot className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">AI Model</h3>
                </div>
                
                <div className="space-y-3">
                  <select
                    value={state.settings.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="dark-input"
                  >
                    {state.models.map((model) => (
                      <option key={model.id} value={model.id} className="bg-gray-800">
                        {model.name} ({model.provider})
                      </option>
                    ))}
                  </select>
                  {state.models.find(m => m.id === state.settings.model) && (
                    <p className="text-sm text-gray-400">
                      {state.models.find(m => m.id === state.settings.model)?.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Sliders className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Advanced Parameters</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Temperature */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Temperature: {state.settings.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={state.settings.temperature}
                      onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <p className="text-xs text-gray-500">Controls randomness (0 = deterministic, 2 = very random)</p>
                  </div>

                  {/* Max Tokens */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Max Tokens: {state.settings.maxTokens}
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="4000"
                      step="100"
                      value={state.settings.maxTokens}
                      onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <p className="text-xs text-gray-500">Maximum length of AI responses</p>
                  </div>

                  {/* Top P */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Top P: {state.settings.topP}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={state.settings.topP}
                      onChange={(e) => handleInputChange('topP', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <p className="text-xs text-gray-500">Controls diversity of word choices</p>
                  </div>

                  {/* Frequency Penalty */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Frequency Penalty: {state.settings.frequencyPenalty}
                    </label>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={state.settings.frequencyPenalty}
                      onChange={(e) => handleInputChange('frequencyPenalty', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <p className="text-xs text-gray-500">Reduces repetition of frequent words</p>
                  </div>
                </div>
              </div>

              {/* System Message */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">System Message</h3>
                </div>
                
                <div className="space-y-3">
                  <textarea
                    value={state.settings.systemMessage}
                    onChange={(e) => handleInputChange('systemMessage', e.target.value)}
                    className="dark-input min-h-[120px] resize-none"
                    placeholder="Enter system message to customize AI behavior..."
                  />
                  <p className="text-sm text-gray-400">
                    This message helps define the AI's personality and behavior. Be specific about what you want the AI to do.
                  </p>
                </div>
              </div>

              {/* Streaming Toggle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Streaming Responses</h3>
                    <p className="text-sm text-gray-400">Enable real-time streaming of AI responses</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('stream', !state.settings.stream)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      state.settings.stream ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        state.settings.stream ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={onClose}
                className="dark-button dark-button-secondary"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;