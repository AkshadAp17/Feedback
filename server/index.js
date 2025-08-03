// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const axios = require('axios');
// const Feedback = require('./models/Feedback');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // Feedback routes
// app.post('/api/ask-gemini', async (req, res) => {
//   try {
//     const { question } = req.body;
    
//     const response = await axios.post(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
//       {
//         contents: [{
//           parts: [{
//             text: question
//           }]
//         }]
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     const answer = response.data.candidates[0].content.parts[0].text;
//     res.json({ answer });

//   } catch (error) {
//     console.error('Gemini API error:', error.response?.data || error.message);
//     res.status(500).json({ error: 'Failed to get answer from Gemini' });
//   }
// });

// // Option 2: Use Cohere API (Free tier available)
// app.post('/api/ask-cohere', async (req, res) => {
//   try {
//     const { question } = req.body;
    
//     const response = await axios.post(
//       'https://api.cohere.ai/v1/generate',
//       {
//         model: 'command-light',
//         prompt: question,
//         max_tokens: 200,
//         temperature: 0.7
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     const answer = response.data.generations[0].text.trim();
//     res.json({ answer });

//   } catch (error) {
//     console.error('Cohere API error:', error.response?.data || error.message);
//     res.status(500).json({ error: 'Failed to get answer from Cohere' });
//   }
// });

// // Option 3: Fallback to a simple rule-based response for testing
// app.post('/api/ask-fallback', async (req, res) => {
//   try {
//     const { question } = req.body;
    
//     // Simple rule-based responses for testing
//     const responses = [
//       "That's an interesting question! Let me think about that...",
//       "Based on what you're asking, I'd suggest considering multiple perspectives.",
//       "That's a great point. Here's what I think about that topic...",
//       "I understand your question. This is a complex topic that deserves careful consideration."
//     ];
    
//     const randomResponse = responses[Math.floor(Math.random() * responses.length)];
//     const answer = `${randomResponse} You asked: "${question}"`;
    
//     res.json({ answer, model: 'fallback' });

//   } catch (error) {
//     console.error('Fallback error:', error.message);
//     res.status(500).json({ error: 'Even the fallback failed!' });
//   }
// });
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const Feedback = require('./models/Feedback');

const app = express();
app.use(cors());
app.use(express.json());

// Environment variable validation
if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is required');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Feedback routes
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, message, rating } = req.body;
    
    // Validation
    if (!name || !message || !rating) {
      return res.status(400).json({ error: 'Name, message, and rating are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const feedback = new Feedback({ name, message, rating });
    await feedback.save();
    
    console.log('✅ New feedback saved:', { name, rating });
    res.status(201).json(feedback);
  } catch (error) {
    console.error('❌ Error saving feedback:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(50);
    res.json(feedbacks);
  } catch (error) {
    console.error('❌ Error fetching feedbacks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete feedback (optional)
app.delete('/api/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(id);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting feedback:', error);
    res.status(500).json({ error: error.message });
  }
});

// Utility function for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Hugging Face LLM integration with retry logic
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Try multiple approaches in order of preference
    const approaches = [
      { name: 'Hugging Face', handler: callHuggingFace },
      { name: 'Cohere', handler: callCohere },
      { name: 'Gemini', handler: callGemini },
      { name: 'Fallback', handler: callFallback }
    ];

    let lastError = null;

    for (const approach of approaches) {
      try {
        console.log(`🔄 Trying ${approach.name}...`);
        const result = await approach.handler(question);
        console.log(`✅ Success with ${approach.name}`);
        return res.json({ 
          answer: result.answer, 
          model: result.model || approach.name.toLowerCase(),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.log(`❌ ${approach.name} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    // If all approaches failed
    throw lastError || new Error('All LLM approaches failed');

  } catch (error) {
    console.error('❌ All LLM approaches failed:', error.message);
    res.status(500).json({ 
      error: 'I apologize, but I\'m having trouble processing your question right now. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
});

// Hugging Face API handler
async function callHuggingFace(question) {
  if (!process.env.HF_API_KEY) {
    throw new Error('HF_API_KEY not configured');
  }

  const models = [
    'microsoft/DialoGPT-medium',
    'facebook/blenderbot-400M-distill',
    'microsoft/DialoGPT-small'
  ];

  for (const model of models) {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        { 
          inputs: question,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            do_sample: true,
            pad_token_id: 50256
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HF_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      let answer = '';
      
      if (Array.isArray(response.data) && response.data[0]?.generated_text) {
        answer = response.data[0].generated_text;
      } else if (response.data?.generated_text) {
        answer = response.data.generated_text;
      } else {
        continue; // Try next model
      }

      // Clean up the answer
      answer = answer.replace(question, '').trim();
      if (answer.length < 10) continue; // Too short, try next model

      return { answer, model };
    } catch (error) {
      if (error.response?.status === 503) {
        console.log(`Model ${model} is loading, trying next...`);
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('All Hugging Face models failed');
}

// Cohere API handler
async function callCohere(question) {
  if (!process.env.COHERE_API_KEY) {
    throw new Error('COHERE_API_KEY not configured');
  }

  const response = await axios.post(
    'https://api.cohere.ai/v1/generate',
    {
      model: 'command-light',
      prompt: `Human: ${question}\nAssistant:`,
      max_tokens: 150,
      temperature: 0.7,
      stop_sequences: ['Human:', 'Assistant:']
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  );

  const answer = response.data.generations[0].text.trim();
  return { answer, model: 'cohere-command-light' };
}

// Google Gemini API handler
async function callGemini(question) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY not configured');
  }

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
    {
      contents: [{
        parts: [{
          text: question
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150
      }
    },
    {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  );

  const answer = response.data.candidates[0].content.parts[0].text;
  return { answer, model: 'gemini-pro' };
}

// Fallback handler for when all APIs fail
async function callFallback(question) {
  const responses = [
    "That's an interesting question! While I can't access external AI services right now, I'd suggest breaking down complex problems into smaller parts.",
    "Great question! Although I'm having connectivity issues with AI services, I recommend researching this topic from multiple reliable sources.",
    "I appreciate your question! While I can't provide an AI-generated answer at the moment, this seems like a topic worth exploring further.",
    "Thanks for asking! I'm currently unable to connect to AI services, but your question touches on some important concepts.",
    "Interesting point! While I can't give you an AI response right now, I'd encourage you to consider different perspectives on this topic."
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  const answer = `${randomResponse}\n\nYour question: "${question}"`;
  
  return { answer, model: 'fallback-system' };
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ 
    error: 'Something went wrong!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/feedback',
      'POST /api/feedback',
      'POST /api/ask',
      'DELETE /api/feedback/:id'
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log('🔑 API Keys configured:', {
    MongoDB: !!process.env.MONGODB_URI,
    HuggingFace: !!process.env.HF_API_KEY,
    Cohere: !!process.env.COHERE_API_KEY,
    Google: !!process.env.GOOGLE_API_KEY
  });
});