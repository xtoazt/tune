import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Zap, User, Copy, Check, Settings, Code, Plus, Sparkles } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useSettings } from '../contexts/SettingsContext';
import { apiService } from '../services/api';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import SettingsModal from './SettingsModal';
import APIDocumentation from './APIDocumentation';
import toast from 'react-hot-toast';

const ChatInterface: React.FC = () => {
  const { currentSession, addMessage, updateMessage, setLoading, setStreaming, state, createSession } = useChat();
  const { state: settingsState } = useSettings();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiDocsOpen, setApiDocsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !currentSession || state.isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsTyping(true);

    // Add user message
    addMessage(currentSession.id, {
      role: 'user',
      content: userMessage,
    });

    // Add assistant message placeholder
    addMessage(currentSession.id, {
      role: 'assistant',
      content: '',
    });
    
    // Get the assistant message ID from the updated session
    const updatedSession = state.sessions.find(s => s.id === currentSession.id);
    const assistantMessage = updatedSession?.messages[updatedSession.messages.length - 1];
    const assistantMessageId = assistantMessage?.id;

    setLoading(true);
    setStreaming(true);

    try {
      const messages = [
        ...currentSession.messages,
        { role: 'user' as const, content: userMessage },
      ];

      if (settingsState.settings.stream) {
        // Streaming response
        let fullResponse = '';
        await apiService.streamChatCompletion({
          messages,
          model: settingsState.settings.model,
          temperature: settingsState.settings.temperature,
          max_tokens: settingsState.settings.maxTokens,
          top_p: settingsState.settings.topP,
          frequency_penalty: settingsState.settings.frequencyPenalty,
          presence_penalty: settingsState.settings.presencePenalty,
          system_message: settingsState.settings.systemMessage,
        }, (chunk) => {
          fullResponse += chunk;
          updateMessage(currentSession.id, assistantMessageId, fullResponse);
        });
      } else {
        // Non-streaming response
        const response = await apiService.chatCompletion({
          messages,
          model: settingsState.settings.model,
          temperature: settingsState.settings.temperature,
          max_tokens: settingsState.settings.maxTokens,
          top_p: settingsState.settings.topP,
          frequency_penalty: settingsState.settings.frequencyPenalty,
          presence_penalty: settingsState.settings.presencePenalty,
          system_message: settingsState.settings.systemMessage,
        });

        updateMessage(currentSession.id, assistantMessageId, response.message.content);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      updateMessage(currentSession.id, assistantMessageId, 'Sorry, I encountered an error. Please try again.');
    } finally {
      setLoading(false);
      setStreaming(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleNewSession = () => {
    createSession('New Chat', settingsState.settings.model, settingsState.settings.systemMessage);
  };

  if (!currentSession) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 gaming-grid">
        <div className="text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto mb-6 rounded-3xl thunder-card-elevated flex items-center justify-center neon-glow">
                <Zap className="w-16 h-16 text-indigo-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <h1 className="text-6xl font-black thunder-logo mb-6">
              THUNDER
            </h1>
            <p className="text-2xl text-gray-300 mb-4 font-medium">
              Advanced AI Assistant
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Experience the power of next-generation AI with lightning-fast responses and unlimited possibilities
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          >
            <div className="feature-card">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-6 gaming-glow">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-400">Powered by GPT-5 with optimized routing for instant responses</p>
            </div>
            
            <div className="feature-card">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center mb-6 gaming-glow">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Fully Tunable</h3>
              <p className="text-gray-400">Customize AI behavior for any task with advanced fine-tuning</p>
            </div>
            
            <div className="feature-card">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center mb-6 gaming-glow">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Developer Ready</h3>
              <p className="text-gray-400">Complete API access with no restrictions or rate limits</p>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onClick={handleNewSession}
            className="thunder-button thunder-button-primary text-xl px-12 py-6 rounded-2xl gaming-glow"
          >
            <Zap className="w-6 h-6 mr-3" />
            Start Thunder Chat
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full gaming-grid">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center gaming-glow">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold thunder-logo">{currentSession.title}</h2>
            <p className="text-sm text-gray-400">
              {state.isStreaming ? 'Thunder is responding...' : 'Thunder Ready • Tunable Mode Active'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setApiDocsOpen(true)}
            className="thunder-button thunder-button-secondary"
            title="API Documentation"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="thunder-button thunder-button-secondary"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleNewSession}
            className="thunder-button thunder-button-primary"
            title="New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {currentSession.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TypingIndicator />
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-800">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask Thunder anything..."
              className="thunder-input resize-none min-h-[60px] max-h-32"
              rows={1}
              disabled={state.isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || state.isLoading}
            className="thunder-button thunder-button-primary disabled:opacity-50 disabled:cursor-not-allowed gaming-glow"
          >
            {state.isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <APIDocumentation isOpen={apiDocsOpen} onClose={() => setApiDocsOpen(false)} />
    </div>
  );
};

export default ChatInterface;