# Tunable AI Bot

A versatile and fine-tunable AI bot with a beautiful, modern interface inspired by warmwind.space. This application provides unrestricted AI capabilities with advanced fine-tuning features.

## Features

### 🤖 **Unrestricted AI**
- No content restrictions or limitations
- Advanced model selection (GPT-4, GPT-3.5, etc.)
- Customizable system messages
- Real-time streaming responses

### 🎨 **Beautiful UI**
- Modern glassmorphism design
- Smooth animations with Framer Motion
- Responsive layout
- Dark theme with gradient backgrounds

### ⚙️ **Advanced Settings**
- Temperature control (0-2)
- Max tokens configuration
- Top-p sampling
- Frequency and presence penalties
- Custom system messages

### 🔧 **Fine-tuning Capabilities**
- Upload training data (JSONL format)
- Create and manage fine-tuning jobs
- Monitor training progress
- Use custom fine-tuned models

### 💬 **Chat Features**
- Multiple chat sessions
- Message history
- Markdown support with syntax highlighting
- Copy messages
- Typing indicators
- Usage statistics

## Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd tune
   npm run install-all
   ```

2. **Set up environment variables:**
   ```bash
   cd server
   cp env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start the development servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend on `http://localhost:5173`

### Production Deployment

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

## API Endpoints

### Chat
- `POST /api/chat` - Send chat messages
- `GET /api/models` - Get available models

### Fine-tuning
- `POST /api/fine-tune/upload` - Upload training data
- `POST /api/fine-tune/create` - Create fine-tuning job
- `GET /api/fine-tune/list` - List fine-tuning jobs
- `GET /api/fine-tune/:id` - Get specific job details

## Configuration

### Chat Settings
- **Model**: Choose from available OpenAI models
- **Temperature**: Controls randomness (0-2)
- **Max Tokens**: Maximum response length
- **Top P**: Nucleus sampling parameter
- **Frequency Penalty**: Reduces repetition
- **Presence Penalty**: Encourages new topics
- **System Message**: Custom AI behavior instructions

### Fine-tuning
1. Prepare your training data in JSONL format:
   ```json
   {"messages": [{"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Hi there!"}]}
   {"messages": [{"role": "user", "content": "How are you?"}, {"role": "assistant", "content": "I'm doing well, thank you!"}]}
   ```

2. Upload the file through the settings panel
3. Create a fine-tuning job
4. Monitor progress and use the fine-tuned model

## Security Features

- API key protection (server-side only)
- Rate limiting
- Input validation
- CORS configuration
- Helmet security headers

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Markdown** for message rendering
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **OpenAI API** integration
- **Multer** for file uploads
- **Helmet** for security
- **CORS** for cross-origin requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the GitHub issues
- Review the documentation
- Test with different models and settings

---

**Note**: This application is designed for unrestricted AI interactions. Please use responsibly and in accordance with your local laws and OpenAI's terms of service.
