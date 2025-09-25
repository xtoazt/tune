import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  RotateCcw, 
  Bot, 
  Thermometer, 
  Hash, 
  Target,
  Zap,
  MessageSquare,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { apiService, Model, FineTuneJob } from '../services/api';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { state, updateSettings, setModels, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'chat' | 'fine-tuning'>('chat');
  const [fineTuneJobs, setFineTuneJobs] = useState<FineTuneJob[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadModels();
      loadFineTuneJobs();
    }
  }, [isOpen]);

  const loadModels = async () => {
    try {
      const models = await apiService.getModels();
      setModels(models);
    } catch (error) {
      console.error('Failed to load models:', error);
      toast.error('Failed to load available models');
    }
  };

  const loadFineTuneJobs = async () => {
    try {
      const jobs = await apiService.getFineTuneJobs();
      setFineTuneJobs(jobs);
    } catch (error) {
      console.error('Failed to load fine-tune jobs:', error);
    }
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully');
    onClose();
  };

  const handleResetSettings = () => {
    resetSettings();
    toast.success('Settings reset to defaults');
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploadingFile(true);
    try {
      const result = await apiService.uploadFineTuneFile(selectedFile);
      toast.success(`File uploaded successfully: ${result.filename}`);
      setSelectedFile(null);
      loadFineTuneJobs();
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'text-green-400';
      case 'running':
        return 'text-blue-400';
      case 'failed':
        return 'text-red-400';
      case 'cancelled':
        return 'text-gray-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-4 h-4" />;
      case 'running':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden glass rounded-2xl border border-white/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/20">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Settings</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('fine-tuning')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'fine-tuning'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <span>Fine-tuning</span>
                </div>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'chat' ? (
                <div className="space-y-6">
                  {/* Model Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <Bot className="w-4 h-4 inline mr-2" />
                      Model
                    </label>
                    <select
                      value={state.settings.model}
                      onChange={(e) => updateSettings({ model: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg glass border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {state.models.map((model) => (
                        <option key={model.id} value={model.id} className="bg-gray-800">
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <Thermometer className="w-4 h-4 inline mr-2" />
                      Temperature: {state.settings.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={state.settings.temperature}
                      onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Focused</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  {/* Max Tokens */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <Hash className="w-4 h-4 inline mr-2" />
                      Max Tokens: {state.settings.maxTokens}
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="4096"
                      step="100"
                      value={state.settings.maxTokens}
                      onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Top P */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <Target className="w-4 h-4 inline mr-2" />
                      Top P: {state.settings.topP}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={state.settings.topP}
                      onChange={(e) => updateSettings({ topP: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Frequency Penalty */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Frequency Penalty: {state.settings.frequencyPenalty}
                    </label>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={state.settings.frequencyPenalty}
                      onChange={(e) => updateSettings({ frequencyPenalty: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Presence Penalty */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Presence Penalty: {state.settings.presencePenalty}
                    </label>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={state.settings.presencePenalty}
                      onChange={(e) => updateSettings({ presencePenalty: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* System Message */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      System Message
                    </label>
                    <textarea
                      value={state.settings.systemMessage}
                      onChange={(e) => updateSettings({ systemMessage: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg glass border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      placeholder="Enter system message to set AI behavior..."
                    />
                  </div>

                  {/* Streaming */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="streaming"
                      checked={state.settings.stream}
                      onChange={(e) => updateSettings({ stream: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="streaming" className="text-sm font-medium text-white">
                      Enable streaming responses
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Upload Training Data</h3>
                    <div className="space-y-4">
                      <div>
                        <input
                          type="file"
                          accept=".jsonl"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Upload a JSONL file with training data for fine-tuning
                        </p>
                      </div>
                      
                      {selectedFile && (
                        <button
                          onClick={handleFileUpload}
                          disabled={uploadingFile}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                        >
                          {uploadingFile ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>Upload File</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Fine-tune Jobs */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Fine-tuning Jobs</h3>
                    <div className="space-y-3">
                      {fineTuneJobs.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <FileText className="w-12 h-12 mx-auto mb-3" />
                          <p>No fine-tuning jobs yet</p>
                          <p className="text-sm">Upload training data to create your first job</p>
                        </div>
                      ) : (
                        fineTuneJobs.map((job) => (
                          <div
                            key={job.id}
                            className="p-4 rounded-lg glass border border-white/20"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-white">{job.id}</h4>
                              <div className={`flex items-center space-x-2 ${getStatusColor(job.status)}`}>
                                {getStatusIcon(job.status)}
                                <span className="text-sm capitalize">{job.status}</span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-400 space-y-1">
                              <p>Model: {job.model}</p>
                              <p>Created: {new Date(job.created_at * 1000).toLocaleString()}</p>
                              {job.finished_at && (
                                <p>Finished: {new Date(job.finished_at * 1000).toLocaleString()}</p>
                              )}
                              {job.fine_tuned_model && (
                                <p className="text-green-400">Fine-tuned Model: {job.fine_tuned_model}</p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-white/20">
              <button
                onClick={handleResetSettings}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Defaults</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
