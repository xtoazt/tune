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
  const { currentSession, addMessage, updateMessage, setLoading, setStreaming, state, createSession } = useChat();
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
    
    // Get the actual message ID from the last message
    const lastMessage = currentSession.messages[currentSession.messages.length - 1];
    const actualAssistantMessageId = lastMessage?.id || assistantMessageId;

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
          updateMessage(currentSession.id, actualAssistantMessageId, fullResponse);
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

        updateMessage(currentSession.id, actualAssistantMessageId, response.message.content);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      updateMessage(currentSession.id, actualAssistantMessageId, 'Sorry, I encountered an error. Please try again.');
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
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="warmwind-container p-12 max-w-2xl text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Welcome to Winded</h2>
            <p className="text-lg text-gray-600 mb-8">
              Create a new chat session to start conversing with your tunable AI assistant. 
              Fine-tune models, customize behavior, and create specialized AI solutions.
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-3 mb-8">
            <button
              onClick={() => createSession('New Chat', settingsState.settings.model, settingsState.settings.systemMessage)}
              className="warmwind-button-primary px-6 py-3 text-sm font-medium"
            >
              Start New Session
            </button>
            <div className="warmwind-button px-6 py-3 text-sm font-medium">
              View Examples
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>AI Ready • Tunable Mode Active</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="warmwind-container p-8">
      {/* Chat Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{currentSession.title}</h3>
          <p className="text-sm text-gray-500">Model: {settingsState.settings.model}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-500">Tunable Mode</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
        <AnimatePresence>
          {currentSession.messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
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
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <TypingIndicator />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask Winded anything... (Press Enter to send, Shift+Enter for new line)"
              className="warmwind-input w-full px-4 py-3 resize-none min-h-[50px] max-h-[120px]"
              rows={1}
              disabled={state.isLoading}
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!input.trim() || state.isLoading}
            className="warmwind-button-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {state.isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Temperature: {settingsState.settings.temperature}</span>
            <span>Max Tokens: {settingsState.settings.maxTokens}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Fine-tunable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
