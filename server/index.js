require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const Feedback = require('./models/Feedback');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      apis: {
        cohere: !!process.env.COHERE_API_KEY,
        openrouter: !!process.env.OPENROUTER_API_KEY,
        google: !!process.env.GOOGLE_API_KEY,
        huggingface: !!process.env.HF_API_KEY
      }
    }
  });
});

// Feedback routes (keep your existing feedback routes)
app.post('/api/feedback', async (req, res) => {
  /* ... existing feedback code ... */
});

app.get('/api/feedback', async (req, res) => {
  /* ... existing feedback code ... */
});

app.delete('/api/feedback/:id', async (req, res) => {
  /* ... existing feedback code ... */
});

// Updated LLM endpoint with Cohere first
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log('\n🔍 NEW QUESTION:', question);
    console.log('🔄 Starting LLM calls...');

    // Try Cohere first (since it's working for you)
    if (process.env.COHERE_API_KEY) {
      try {
        console.log('🚀 Trying Cohere first...');
        const result = await callCohere(question);
        console.log('✅ Cohere SUCCESS!');
        return res.json({
          answer: result.answer,
          model: result.model,
          provider: 'Cohere',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.log('❌ Cohere failed:', error.message);
      }
    }

    // Then try Google Gemini
    if (process.env.GOOGLE_API_KEY) {
      try {
        console.log('🚀 Trying Google Gemini...');
        const result = await callGemini(question);
        console.log('✅ Gemini SUCCESS!');
        return res.json({
          answer: result.answer,
          model: result.model,
          provider: 'Google',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.log('❌ Gemini failed:', error.message);
      }
    }

    // Then try OpenRouter
    if (process.env.OPENROUTER_API_KEY) {
      try {
        console.log('🚀 Trying OpenRouter...');
        const result = await callOpenRouter(question);
        console.log('✅ OpenRouter SUCCESS!');
        return res.json({
          answer: result.answer,
          model: result.model,
          provider: 'OpenRouter',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.log('❌ OpenRouter failed:', error.message);
      }
    }

    // Then try Hugging Face
    if (process.env.HF_API_KEY) {
      try {
        console.log('🚀 Trying Hugging Face...');
        const result = await callHuggingFace(question);
        console.log('✅ Hugging Face SUCCESS!');
        return res.json({
          answer: result.answer,
          model: result.model,
          provider: 'HuggingFace',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.log('❌ Hugging Face failed:', error.message);
      }
    }

    // If ALL APIs fail
    console.log('❌ ALL LLM APIs FAILED');
    res.status(503).json({
      error: 'All AI services are currently unavailable',
      suggestion: 'Please try again later',
      status: 'service_unavailable',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({
      error: 'An unexpected error occurred',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Updated Cohere API call with better error handling
async function callCohere(question) {
  try {
    console.log('   🔄 Calling Cohere API...');
    
    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        model: 'command',
        message: question,
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      }
    );

    if (response.data?.text) {
      const answer = response.data.text.trim();
      console.log(`   ✅ Got response from Cohere (${answer.length} chars)`);
      return {
        answer,
        model: 'cohere-command'
      };
    }
    throw new Error('No text in response');
  } catch (error) {
    console.error('Cohere API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

// Updated Gemini API call
async function callGemini(question) {
  try {
    console.log('   🔄 Calling Gemini API...');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [{
          parts: [{ text: question }]
        }],
        generationConfig: {
          maxOutputTokens: 300
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const answer = response.data.candidates[0].content.parts[0].text.trim();
      console.log(`   ✅ Got response from Gemini (${answer.length} chars)`);
      return {
        answer,
        model: 'gemini-pro'
      };
    }
    throw new Error('No text in response');
  } catch (error) {
    console.error('Gemini API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

// Updated OpenRouter API call with simpler implementation
async function callOpenRouter(question) {
  try {
    console.log('   🔄 Calling OpenRouter API...');
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo', // Start with lighter model
        messages: [{
          role: 'user',
          content: question
        }],
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000'
        },
        timeout: 20000
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      const answer = response.data.choices[0].message.content.trim();
      console.log(`   ✅ Got response from OpenRouter (${answer.length} chars)`);
      return {
        answer,
        model: 'gpt-3.5-turbo'
      };
    }
    throw new Error('No content in response');
  } catch (error) {
    console.error('OpenRouter API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

// Keep your existing Hugging Face implementation
async function callHuggingFace(question) {
  /* ... existing Hugging Face code ... */
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔑 Active Services:`);
  console.log(`   - Cohere: ${process.env.COHERE_API_KEY ? '✅' : '❌'}`);
  console.log(`   - Google: ${process.env.GOOGLE_API_KEY ? '✅' : '❌'}`);
  console.log(`   - OpenRouter: ${process.env.OPENROUTER_API_KEY ? '✅' : '❌'}`);
  console.log(`   - HuggingFace: ${process.env.HF_API_KEY ? '✅' : '❌'}`);
  console.log(`\n📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;