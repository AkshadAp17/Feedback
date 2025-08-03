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
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Feedback routes
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, message, rating } = req.body;
    
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

// PURE LLM ENDPOINT - NO HARDCODED RESPONSES AT ALL
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log('\n🔍 NEW QUESTION:', question);
    console.log('🔄 Starting LLM calls...');

    // Try OpenRouter first
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

    // Try Google Gemini
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

    // Try Cohere
    if (process.env.COHERE_API_KEY) {
      try {
        console.log('🚀 Trying Cohere...');
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

    // Try Hugging Face
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
    res.status(500).json({
      error: 'All AI services are currently unavailable. Please check your API keys and try again later.',
      timestamp: new Date().toISOString(),
      availableKeys: {
        openrouter: !!process.env.OPENROUTER_API_KEY,
        google: !!process.env.GOOGLE_API_KEY,
        cohere: !!process.env.COHERE_API_KEY,
        huggingface: !!process.env.HF_API_KEY
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({
      error: 'An unexpected error occurred while processing your question.',
      timestamp: new Date().toISOString()
    });
  }
});

// OpenRouter API call
async function callOpenRouter(question) {
  const models = [
    'anthropic/claude-3-sonnet-20240229',
    'openai/gpt-4-turbo-preview',
    'openai/gpt-3.5-turbo',
    'meta-llama/llama-2-70b-chat'
  ];

  for (const model of models) {
    try {
      console.log(`   🔄 Trying model: ${model}`);
      
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant. Provide clear, accurate, and detailed answers.'
            },
            {
              role: 'user',
              content: question
            }
          ],
          max_tokens: 800,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'AI Assistant'
          },
          timeout: 45000
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        const answer = response.data.choices[0].message.content.trim();
        console.log(`   ✅ Got response from ${model} (${answer.length} chars)`);
        return {
          answer,
          model: model
        };
      }
    } catch (error) {
      console.log(`   ❌ ${model} failed: ${error.message}`);
      continue;
    }
  }
  
  throw new Error('All OpenRouter models failed');
}

// Google Gemini API call
async function callGemini(question) {
  console.log('   🔄 Calling Gemini API...');
  
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
        maxOutputTokens: 800
      }
    },
    {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
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
  
  throw new Error('Invalid Gemini response');
}

// Cohere API call
async function callCohere(question) {
  console.log('   🔄 Calling Cohere API...');
  
  const response = await axios.post(
    'https://api.cohere.ai/v1/generate',
    {
      model: 'command',
      prompt: `Question: ${question}\n\nAnswer:`,
      max_tokens: 400,
      temperature: 0.7,
      stop_sequences: ['Question:', '\n\n']
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );

  if (response.data?.generations?.[0]?.text) {
    const answer = response.data.generations[0].text.trim();
    console.log(`   ✅ Got response from Cohere (${answer.length} chars)`);
    return {
      answer,
      model: 'cohere-command'
    };
  }
  
  throw new Error('Invalid Cohere response');
}

// Hugging Face API call
async function callHuggingFace(question) {
  console.log('   🔄 Calling Hugging Face API...');
  
  const models = [
    'microsoft/DialoGPT-large',
    'facebook/blenderbot-400M-distill'
  ];

  for (const model of models) {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          inputs: question,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            return_full_text: false
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

      if (response.data?.[0]?.generated_text) {
        const answer = response.data[0].generated_text.trim();
        if (answer.length > 10) {
          console.log(`   ✅ Got response from ${model} (${answer.length} chars)`);
          return {
            answer,
            model: model
          };
        }
      }
    } catch (error) {
      console.log(`   ❌ ${model} failed: ${error.message}`);
      continue;
    }
  }
  
  throw new Error('All Hugging Face models failed');
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 AI Assistant Server Starting...`);
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log('\n🔑 API Keys Status:');
  console.log(`   OpenRouter: ${process.env.OPENROUTER_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Google: ${process.env.GOOGLE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Cohere: ${process.env.COHERE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Hugging Face: ${process.env.HF_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   MongoDB: ${process.env.MONGODB_URI ? '✅ Configured' : '❌ Missing'}`);
  console.log('\n🚨 PURE LLM MODE - NO HARDCODED RESPONSES!');
  console.log('📝 Every response will come from actual AI models\n');
});

module.exports = app;