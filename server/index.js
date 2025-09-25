const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const multer = require('multer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tunable AI Bot Server is running' });
});

// Get available models
app.get('/api/models', async (req, res) => {
  try {
    const models = await openai.models.list();
    const availableModels = models.data
      .filter(model => model.id.includes('gpt') || model.id.includes('davinci') || model.id.includes('curie'))
      .map(model => ({
        id: model.id,
        name: model.id,
        created: model.created,
        owned_by: model.owned_by
      }));
    
    res.json(availableModels);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Chat completion endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { 
      messages, 
      model = 'gpt-4', 
      temperature = 0.7, 
      max_tokens = 2000,
      top_p = 1,
      frequency_penalty = 0,
      presence_penalty = 0,
      stream = false,
      system_message = null
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Add system message if provided
    const chatMessages = system_message 
      ? [{ role: 'system', content: system_message }, ...messages]
      : messages;

    const completionParams = {
      model,
      messages: chatMessages,
      temperature: Math.max(0, Math.min(2, temperature)),
      max_tokens: Math.max(1, Math.min(4096, max_tokens)),
      top_p: Math.max(0, Math.min(1, top_p)),
      frequency_penalty: Math.max(-2, Math.min(2, frequency_penalty)),
      presence_penalty: Math.max(-2, Math.min(2, presence_penalty)),
    };

    if (stream) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = await openai.chat.completions.create({
        ...completionParams,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(content);
        }
      }
      res.end();
    } else {
      const completion = await openai.chat.completions.create(completionParams);
      res.json({
        message: completion.choices[0].message,
        usage: completion.usage,
        model: completion.model
      });
    }
  } catch (error) {
    console.error('Chat completion error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

// Fine-tuning endpoints
app.post('/api/fine-tune/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = await openai.files.create({
      file: req.file.buffer,
      purpose: 'fine-tune',
    });

    res.json({ file_id: file.id, filename: req.file.originalname });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

app.post('/api/fine-tune/create', async (req, res) => {
  try {
    const { training_file, validation_file, model, suffix } = req.body;

    if (!training_file) {
      return res.status(400).json({ error: 'Training file is required' });
    }

    const fineTune = await openai.fineTuning.jobs.create({
      training_file,
      validation_file,
      model: model || 'gpt-3.5-turbo',
      suffix: suffix || 'tunable-bot',
    });

    res.json(fineTune);
  } catch (error) {
    console.error('Fine-tune creation error:', error);
    res.status(500).json({ error: 'Failed to create fine-tune job' });
  }
});

app.get('/api/fine-tune/list', async (req, res) => {
  try {
    const fineTunes = await openai.fineTuning.jobs.list();
    res.json(fineTunes.data);
  } catch (error) {
    console.error('Fine-tune list error:', error);
    res.status(500).json({ error: 'Failed to list fine-tune jobs' });
  }
});

app.get('/api/fine-tune/:id', async (req, res) => {
  try {
    const fineTune = await openai.fineTuning.jobs.retrieve(req.params.id);
    res.json(fineTune);
  } catch (error) {
    console.error('Fine-tune retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve fine-tune job' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Tunable AI Bot Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
