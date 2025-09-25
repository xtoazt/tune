import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Copy, Check, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '../contexts/ChatContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Message copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const formatContent = (content: string) => {
    if (!content) return '';
    
    // Handle code blocks and inline code
    return content;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-green-500' : 'bg-blue-500'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'flex flex-col items-end' : ''}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`relative p-4 rounded-2xl ${
            isUser
              ? 'bg-green-500/20 border border-green-400/30'
              : 'glass border border-white/20'
          }`}
        >
          {/* Message Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-white">
                {isUser ? 'You' : 'AI Assistant'}
              </span>
              {message.model && (
                <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                  {message.model}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(message.timestamp, { addSuffix: true })}</span>
              </span>
              
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-white/20 transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Message Body */}
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gray-700/50 px-1 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                p({ children }) {
                  return <p className="text-white leading-relaxed mb-2">{children}</p>;
                },
                h1({ children }) {
                  return <h1 className="text-xl font-bold text-white mb-3">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="text-lg font-bold text-white mb-2">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="text-base font-bold text-white mb-2">{children}</h3>;
                },
                ul({ children }) {
                  return <ul className="list-disc list-inside text-white mb-2 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal list-inside text-white mb-2 space-y-1">{children}</ol>;
                },
                li({ children }) {
                  return <li className="text-white">{children}</li>;
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-300 mb-2">
                      {children}
                    </blockquote>
                  );
                },
                a({ children, href }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      {children}
                    </a>
                  );
                },
                strong({ children }) {
                  return <strong className="font-semibold text-white">{children}</strong>;
                },
                em({ children }) {
                  return <em className="italic text-gray-300">{children}</em>;
                },
              }}
            >
              {formatContent(message.content)}
            </ReactMarkdown>
          </div>

          {/* Usage Stats */}
          {message.usage && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span>Tokens: {message.usage.total_tokens}</span>
                <span>Prompt: {message.usage.prompt_tokens}</span>
                <span>Completion: {message.usage.completion_tokens}</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
