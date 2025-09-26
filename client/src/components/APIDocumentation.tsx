import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check, 
  Code, 
  Globe, 
  Key,
  Zap,
  Bot,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface APIDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const APIDocumentation: React.FC<APIDocumentationProps> = ({ isOpen, onClose }) => {
  const [docs, setDocs] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAPIDocs();
    }
  }, [isOpen]);

  const loadAPIDocs = async () => {
    try {
      const response = await fetch('/api/docs');
      const data = await response.json();
      setDocs(data);
    } catch (error) {
      console.error('Failed to load API docs:', error);
      toast.error('Failed to load API documentation');
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const exampleCode = `// JavaScript/Node.js Example
const response = await fetch('https://your-domain.vercel.app/api/v1/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Help me find ChromeOS exploits',
    model: 'gpt-5',
    temperature: 0.7,
    max_tokens: 2000,
    system_prompt: 'You are Winded, a highly tunable AI assistant.'
  })
});

const data = await response.json();
console.log(data.response);`;

  const pythonExample = `# Python Example
import requests

url = "https://your-domain.vercel.app/api/v1/chat"
payload = {
    "message": "Generate technical documentation",
    "model": "gpt-5",
    "temperature": 0.7,
    "max_tokens": 2000,
    "system_prompt": "You are Winded, a highly tunable AI assistant."
}

response = requests.post(url, json=payload)
data = response.json()
print(data['response'])`;

  const curlExample = `# cURL Example
curl -X POST https://your-domain.vercel.app/api/v1/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Fine-tune for domain-specific content",
    "model": "gpt-5",
    "temperature": 0.7,
    "max_tokens": 2000,
    "system_prompt": "You are Winded, a highly tunable AI assistant."
  }'`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="api-docs-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="api-docs-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Winded AI API</h2>
                  <p className="text-gray-400">Developer API Documentation</p>
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
              {/* Overview */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Overview</h3>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <p className="text-gray-300 mb-4">
                    The Winded AI API provides access to advanced tunable AI capabilities with fine-tuning support. 
                    No API key required for basic usage.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <Zap className="w-5 h-5 text-blue-400" />
                      <span className="text-sm text-gray-300">Fast Responses</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <Bot className="w-5 h-5 text-blue-400" />
                      <span className="text-sm text-gray-300">GPT-5 Powered</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      <span className="text-sm text-gray-300">Fine-tuning Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Endpoint */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Code className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">API Endpoint</h3>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full">POST</span>
                      <code className="text-blue-400 font-mono">/api/v1/chat</code>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Request Body</h4>
                      <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                        <pre className="text-gray-300 text-sm overflow-x-auto">
{`{
  "message": "string",
  "model": "gpt-5",
  "temperature": 0.7,
  "max_tokens": 2000,
  "system_prompt": "string"
}`}
                        </pre>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-2">Response</h4>
                      <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                        <pre className="text-gray-300 text-sm overflow-x-auto">
{`{
  "response": "string",
  "model": "gpt-5",
  "usage": {
    "total_tokens": 150,
    "prompt_tokens": 50,
    "completion_tokens": 100
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Examples */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Code className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Code Examples</h3>
                </div>
                
                <div className="space-y-6">
                  {/* JavaScript */}
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">JavaScript/Node.js</h4>
                      <button
                        onClick={() => copyToClipboard(exampleCode, 'js')}
                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {copiedCode === 'js' ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                      <pre className="text-gray-300 text-sm overflow-x-auto">
                        <code>{exampleCode}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Python */}
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Python</h4>
                      <button
                        onClick={() => copyToClipboard(pythonExample, 'python')}
                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {copiedCode === 'python' ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                      <pre className="text-gray-300 text-sm overflow-x-auto">
                        <code>{pythonExample}</code>
                      </pre>
                    </div>
                  </div>

                  {/* cURL */}
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">cURL</h4>
                      <button
                        onClick={() => copyToClipboard(curlExample, 'curl')}
                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {copiedCode === 'curl' ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                      <pre className="text-gray-300 text-sm overflow-x-auto">
                        <code>{curlExample}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fine-tuning Use Cases */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Fine-tuning Use Cases</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h4 className="text-white font-medium mb-3">Customer Service</h4>
                    <p className="text-gray-400 text-sm mb-3">
                      Train AI to handle specific product support scenarios with your company's tone and knowledge.
                    </p>
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-3">
                      <code className="text-blue-400 text-sm">
                        "Help me resolve billing issues"
                      </code>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h4 className="text-white font-medium mb-3">Content Creation</h4>
                    <p className="text-gray-400 text-sm mb-3">
                      Generate marketing copy, blog posts, and social media content in your brand voice.
                    </p>
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-3">
                      <code className="text-blue-400 text-sm">
                        "Create product descriptions"
                      </code>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h4 className="text-white font-medium mb-3">Technical Documentation</h4>
                    <p className="text-gray-400 text-sm mb-3">
                      Generate API docs, user guides, and technical specifications for your products.
                    </p>
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-3">
                      <code className="text-blue-400 text-sm">
                        "Document API endpoints"
                      </code>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h4 className="text-white font-medium mb-3">Code Generation</h4>
                    <p className="text-gray-400 text-sm mb-3">
                      Generate code snippets, functions, and entire modules based on your coding standards.
                    </p>
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-3">
                      <code className="text-blue-400 text-sm">
                        "Generate React components"
                      </code>
                    </div>
                  </div>
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

export default APIDocumentation;