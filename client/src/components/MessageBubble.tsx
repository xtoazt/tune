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
        isUser ? 'bg-gray-100' : 'bg-gray-100'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-gray-600" />
        ) : (
          <Bot className="w-4 h-4 text-gray-600" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'flex flex-col items-end' : ''}`}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`relative p-4 rounded-lg ${
            isUser
              ? 'bg-gray-50 border border-gray-200'
              : 'bg-white border border-gray-200 shadow-sm'
          }`}
        >
          {/* Message Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-800">
                {isUser ? 'You' : 'Winded'}
              </span>
              {message.model && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {message.model}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(message.timestamp, { addSuffix: true })}</span>
              </span>
              
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Message Body */}
          <div className="prose max-w-none">
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
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-gray-800" {...props}>
                      {children}
                    </code>
                  );
                },
                p({ children }) {
                  return <p className="text-gray-800 leading-relaxed mb-2">{children}</p>;
                },
                h1({ children }) {
                  return <h1 className="text-xl font-bold text-gray-800 mb-3">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="text-lg font-bold text-gray-800 mb-2">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="text-base font-bold text-gray-800 mb-2">{children}</h3>;
                },
                ul({ children }) {
                  return <ul className="list-disc list-inside text-gray-800 mb-2 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal list-inside text-gray-800 mb-2 space-y-1">{children}</ol>;
                },
                li({ children }) {
                  return <li className="text-gray-800">{children}</li>;
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-2">
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
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {children}
                    </a>
                  );
                },
                strong({ children }) {
                  return <strong className="font-semibold text-gray-800">{children}</strong>;
                },
                em({ children }) {
                  return <em className="italic text-gray-600">{children}</em>;
                },
              }}
            >
              {formatContent(message.content)}
            </ReactMarkdown>
          </div>

          {/* Usage Stats */}
          {message.usage && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
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
