import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Bot, User, Copy, Check, Settings, Code, Plus } from 'lucide-react';
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Bot className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to Winded</h1>
            <p className="text-xl text-gray-300 mb-8">
              Your advanced tunable AI assistant with fine-tuning capabilities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="feature-card">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Advanced AI</h3>
              <p className="text-gray-400">Powered by GPT-5 with automatic provider routing for optimal performance</p>
            </div>
            
            <div className="feature-card">
              <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Fine-tuning</h3>
              <p className="text-gray-400">Customize AI behavior for specific tasks and use cases</p>
            </div>
          </div>

          <button
            onClick={handleNewSession}
            className="dark-button dark-button-primary text-lg px-8 py-4 rounded-2xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start New Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{currentSession.title}</h2>
            <p className="text-sm text-gray-400">
              {state.isStreaming ? 'AI is responding...' : 'AI Ready • Tunable Mode Active'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setApiDocsOpen(true)}
            className="dark-button dark-button-secondary"
            title="API Documentation"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="dark-button dark-button-secondary"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleNewSession}
            className="dark-button dark-button-primary"
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
      <div className="p-6 border-t border-gray-700">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask Winded anything..."
              className="dark-input resize-none min-h-[60px] max-h-32"
              rows={1}
              disabled={state.isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || state.isLoading}
            className="dark-button dark-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
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