import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Bot, User, Copy, Check } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useSettings } from '../contexts/SettingsContext';
import { apiService } from '../services/api';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import toast from 'react-hot-toast';

const ChatInterface: React.FC = () => {
  const { currentSession, addMessage, updateMessage, setLoading, setStreaming, state } = useChat();
  const { state: settingsState } = useSettings();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
    const assistantMessageId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    addMessage(currentSession.id, {
      role: 'assistant',
      content: '',
    });

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
    
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  };

  if (!currentSession) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Bot className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-float" />
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Winded</h2>
          <p className="text-gray-300 mb-6 max-w-md">
            Create a new chat session to start conversing with your unrestricted AI assistant. No limitations, no restrictions.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>AI Ready • Unrestricted Mode</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {currentSession.messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <TypingIndicator />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                className="w-full px-4 py-3 rounded-xl glass border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none min-h-[50px] max-h-[120px]"
                rows={1}
                disabled={state.isLoading}
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!input.trim() || state.isLoading}
              className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center"
            >
              {state.isLoading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </motion.button>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Model: {settingsState.settings.model}</span>
              <span>Temp: {settingsState.settings.temperature}</span>
              <span>Max Tokens: {settingsState.settings.maxTokens}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Unrestricted Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
