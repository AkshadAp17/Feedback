# 🎯 Feedback Tracker & AI Assistant

A modern full-stack web application that combines user feedback management with AI-powered question answering. Built with React, Node.js, Express, and MongoDB, featuring multiple AI API integrations for maximum reliability.

## 🖼️ Application Overview

The application features a clean, modern interface with two main sections:

- **Left Panel**: Feedback submission form with name, message, and star rating system
- **Right Panel**: AI Assistant chat interface with real-time question answering
- **Status Bar**: Real-time server and database connection monitoring
- **Bottom Section**: Dynamic feedback display with management options

## ✨ Features

### 📝 Feedback Management
- **Submit Feedback**: Users can submit feedback with name, message, and 1-5 star ratings
- **View Feedback**: Display all feedback in chronological order with timestamps
- **Delete Feedback**: Remove unwanted feedback entries
- **Real-time Updates**: Automatic refresh and real-time status updates
- **Input Validation**: Client and server-side validation with character limits

### 🤖 AI Assistant
- **Multi-AI Integration**: Supports Hugging Face, Google Gemini, and Cohere APIs
- **Automatic Fallback**: If one AI service fails, automatically tries the next
- **Smart Retry Logic**: Handles API rate limits and temporary service outages
- **Real-time Responses**: Interactive chat-like interface with loading states
- **Error Handling**: User-friendly error messages and timeout handling

### 🛠️ Technical Features
- **Health Monitoring**: Server and database status monitoring
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Error Boundaries**: Comprehensive error handling and user feedback
- **Environment Configuration**: Flexible configuration for different environments
- **API Documentation**: Built-in endpoint documentation

## 🏗️ Architecture

```
feedback-tracker/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styles
│   │   └── index.js       # React entry point
│   ├── public/
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── models/
│   │   └── Feedback.js    # MongoDB schema
│   ├── index.js           # Express server
│   ├── .env               # Environment variables
│   └── package.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- At least one AI API key (Hugging Face recommended)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd feedback-tracker
```

### 2. Server Setup
```bash
cd server
npm install
```

Create `.env` file:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/feedback-tracker

# Server
PORT=5000
NODE_ENV=development

# AI APIs (need at least one)
HF_API_KEY=hf_your_hugging_face_token
GOOGLE_API_KEY=your_google_gemini_key
COHERE_API_KEY=your_cohere_key
```

Start the server:
```bash
npm run dev
```

### 3. Client Setup
```bash
cd ../client
npm install
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🔑 API Keys Setup

### Hugging Face (Recommended)
1. Go to [huggingface.co](https://huggingface.co)
2. Sign up for free account
3. Go to Settings → Access Tokens
4. Create new token with "Read" permissions
5. Copy token (starts with `hf_`)

### Google Gemini
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the generated key

### Cohere
1. Go to [Cohere Dashboard](https://dashboard.cohere.ai/api-keys)
2. Sign up for free account
3. Copy the provided API key

### MongoDB Atlas (Cloud Option)
1. Visit [MongoDB Atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Replace username/password in connection string

## 📡 API Endpoints

### Feedback Endpoints
```http
GET    /api/health              # Server health check
GET    /api/feedback            # Get all feedback
POST   /api/feedback            # Submit new feedback
DELETE /api/feedback/:id        # Delete feedback by ID
```

### AI Endpoints
```http
POST   /api/ask                 # Ask AI assistant a question
```

### Example API Usage

#### Submit Feedback
```javascript
POST /api/feedback
Content-Type: application/json

{
  "name": "John Doe",
  "message": "Great application!",
  "rating": 5
}
```

#### Ask AI Question
```javascript
POST /api/ask
Content-Type: application/json

{
  "question": "What is machine learning?"
}
```

## 🛠️ Development

### Server Development
```bash
cd server
npm run dev          # Start with nodemon (auto-restart)
npm start           # Start production server
```

### Client Development
```bash
cd client
npm start           # Start development server
npm run build       # Build for production
```

### Environment Variables

#### Server (.env)
```env
# Required
MONGODB_URI=mongodb://localhost:27017/feedback-tracker

# Optional (for production)
PORT=5000
NODE_ENV=production

# AI APIs (at least one required)
HF_API_KEY=hf_your_token
GOOGLE_API_KEY=your_key
COHERE_API_KEY=your_key
```

#### Client (.env.local)
```env
# Optional - only if backend is on different host
REACT_APP_API_URL=http://localhost:5000
```

## 🔧 Configuration

### AI Service Priority
The application tries AI services in this order:
1. **Hugging Face** (Most reliable free tier)
2. **Cohere** (Good fallback)
3. **Google Gemini** (High quality responses)
4. **Fallback System** (If all APIs fail)

### Database Schema
```javascript
{
  name: String (required, max 100 chars),
  message: String (required, max 500 chars),
  rating: Number (required, 1-5),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## 🎨 UI Features

### Responsive Design
- Mobile-first approach
- Tailwind CSS for styling
- Interactive components with hover effects
- Loading animations and spinners

### User Experience
- Real-time form validation
- Character counters
- Success/error notifications
- Auto-clearing messages
- Confirmation dialogs for destructive actions

## 🔒 Security Features

- Input validation and sanitization
- MongoDB injection protection
- API rate limiting consideration
- Error message sanitization
- Environment variable protection

## 📦 Dependencies

### Server
```json
{
  "express": "^4.18.0",
  "mongoose": "^8.0.0",
  "cors": "^2.8.5",
  "axios": "^1.6.0",
  "dotenv": "^16.3.0"
}
```

### Client
```json
{
  "react": "^18.2.0",
  "axios": "^1.6.0",
  "tailwindcss": "^3.3.0"
}
```

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)
1. Set environment variables in platform
2. Ensure MongoDB Atlas connection
3. Set `NODE_ENV=production`
4. Deploy from repository

### Frontend Deployment (Vercel/Netlify)
1. Set `REACT_APP_API_URL` to backend URL
2. Build and deploy
3. Configure redirects for SPA

### Docker Deployment
```dockerfile
# Example Dockerfile for server
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

#### "Server not responding"
- Check if server is running on port 5000
- Verify MongoDB connection
- Check environment variables

#### "AI not working"
- Verify API keys are correct
- Check API key permissions
- Monitor rate limits

#### "Database connection failed"
- Ensure MongoDB is running (local)
- Check Atlas credentials (cloud)
- Verify network connectivity

### Debug Mode
Set `NODE_ENV=development` for detailed error logs.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/AkshadAp17/)

## 🙏 Acknowledgments

- Hugging Face for free AI API access
- MongoDB for database hosting
- Tailwind CSS for styling framework
- React team for the amazing framework

## 📞 Support

For support, email akshadapastambh37@gmail.com or create an issue in the repository.

---

⭐ **Star this repository if you found it helpful!**

