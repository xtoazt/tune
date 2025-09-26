import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, User, Copy, Check, Clock } from 'lucide-react';
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
    return content;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start space-x-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 gaming-glow' 
          : 'thunder-card border border-gray-700'
      }`}>
        {isUser ? (
          <User className="w-6 h-6 text-white" />
        ) : (
          <Zap className="w-6 h-6 text-indigo-400" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-4xl ${isUser ? 'flex flex-col items-end' : ''}`}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`relative p-6 rounded-2xl ${
            isUser
              ? 'message-bubble-user'
              : 'message-bubble-assistant'
          }`}
        >
          {/* Message Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold text-white">
                {isUser ? 'You' : 'Thunder'}
              </span>
              {message.model && (
                <span className="text-xs text-gray-300 bg-gray-700 px-3 py-1 rounded-full border border-gray-600">
                  {message.model}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-400 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(message.timestamp, { addSuffix: true })}</span>
              </span>
              
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
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
                      className="rounded-xl border border-gray-600"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gray-700 px-2 py-1 rounded text-sm text-gray-200 border border-gray-600" {...props}>
                      {children}
                    </code>
                  );
                },
                p({ children }) {
                  return <p className="text-gray-100 leading-relaxed mb-3">{children}</p>;
                },
                h1({ children }) {
                  return <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="text-xl font-bold text-white mb-3">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="text-lg font-bold text-white mb-2">{children}</h3>;
                },
                ul({ children }) {
                  return <ul className="list-disc list-inside text-gray-100 mb-3 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal list-inside text-gray-100 mb-3 space-y-1">{children}</ol>;
                },
                li({ children }) {
                  return <li className="text-gray-100">{children}</li>;
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-300 mb-3">
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
                      className="text-indigo-400 hover:text-indigo-300 underline"
                    >
                      {children}
                    </a>
                  );
                },
                strong({ children }) {
                  return <strong className="font-bold text-white">{children}</strong>;
                },
                em({ children }) {
                  return <em className="italic text-gray-300">{children}</em>;
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-600 rounded-lg">
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children }) {
                  return (
                    <th className="border border-gray-600 px-4 py-2 bg-gray-800 text-white font-semibold text-left">
                      {children}
                    </th>
                  );
                },
                td({ children }) {
                  return (
                    <td className="border border-gray-600 px-4 py-2 text-gray-100">
                      {children}
                    </td>
                  );
                },
              }}
            >
              {formatContent(message.content)}
            </ReactMarkdown>
          </div>

          {/* Usage Stats */}
          {message.usage && (
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="flex items-center space-x-6 text-xs text-gray-400">
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