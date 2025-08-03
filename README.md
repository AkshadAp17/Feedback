# AI Assistant & Feedback Tracker 🤖✨

A modern, full-stack web application that combines AI-powered chat functionality with comprehensive feedback management and analytics. Built with React frontend and Node.js backend, featuring multiple AI providers and a beautiful glassmorphic UI.

## ✨ Features

### 🤖 AI Chat Assistant
- **Multi-Provider Support**: Integrates with Cohere, Google Gemini, OpenRouter, and Hugging Face APIs
- **Intelligent Fallback**: Automatically tries different AI providers if one fails
- **Real-time Conversations**: Smooth, responsive chat interface with typing indicators
- **Model Information**: Shows which AI model and provider responded to each message

### 💬 Feedback Management
- **User Feedback Collection**: Easy-to-use feedback form with star ratings
- **Advanced Filtering**: Filter by rating, search by content, and sort options
- **Real-time Updates**: Instant feedback submission and management
- **Data Export**: Export feedback data to CSV format

### 📊 Analytics Dashboard
- **Comprehensive Metrics**: Total feedback count, average ratings, weekly trends
- **Visual Distribution**: Rating distribution charts and activity timelines
- **Performance Insights**: Daily averages and recent activity tracking
- **Interactive Charts**: Beautiful, responsive data visualizations

### 🎨 Modern UI/UX
- **Glassmorphic Design**: Beautiful glass-like effects with backdrop blur
- **Animated Background**: Floating particles and gradient animations
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Eye-friendly dark interface with vibrant accents
- **Smooth Transitions**: Polished animations and hover effects

## 🚀 Tech Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Beautiful, customizable icons
- **Responsive Design**: Mobile-first approach

### Backend
- **Node.js**: JavaScript runtime for server-side logic
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database for data persistence
- **Mongoose**: MongoDB object modeling for Node.js

### AI Integrations
- **Cohere API**: Advanced language models
- **Google Gemini**: Google's AI language model
- **OpenRouter**: Access to multiple AI models
- **Hugging Face**: Open-source ML models

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- API keys for AI services (at least one required)

### Clone the Repository
```bash
git clone https://github.com/yourusername/ai-assistant-feedback-tracker.git
cd ai-assistant-feedback-tracker
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Frontend Setup
```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install
```

## ⚙️ Configuration

Create a `.env` file in the backend directory with your configuration:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ai-assistant
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-assistant

# Server Configuration
PORT=5000
NODE_ENV=development

# AI API Keys (at least one required)
COHERE_API_KEY=your_cohere_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
HF_API_KEY=your_huggingface_api_key_here
```

### Getting API Keys

#### Cohere API
1. Visit [Cohere Dashboard](https://dashboard.cohere.ai/)
2. Sign up/Login and navigate to API Keys
3. Generate a new API key

#### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Enable the Generative Language API

#### OpenRouter API
1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up and go to Keys section
3. Create a new API key

#### Hugging Face API
1. Go to [Hugging Face](https://huggingface.co/settings/tokens)
2. Create a new access token
3. Select appropriate permissions

## 🏃‍♂️ Running the Application

### Start the Backend Server
```bash
cd backend
npm start
```
The backend will run on `http://localhost:5000`

### Start the Frontend Development Server
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

### Production Build
```bash
# Build the frontend for production
cd frontend
npm run build

# Serve the built files (optional)
npm install -g serve
serve -s build -l 3000
```

## 📱 Usage

### Chat Interface
1. **Start Chatting**: Type your message in the input field and press Enter or click Send
2. **AI Responses**: The system automatically tries different AI providers for the best response
3. **Message History**: View your conversation history with timestamps and model information
4. **Error Handling**: Graceful error messages if all AI services are unavailable

### Feedback Management
1. **Submit Feedback**: Fill out the feedback form with your name, rating, and message
2. **View Feedback**: Browse all submitted feedback with filtering and sorting options
3. **Search & Filter**: Use the search bar and filters to find specific feedback
4. **Export Data**: Download feedback data as CSV for external analysis

### Analytics Dashboard
1. **Overview Metrics**: View total feedback, average rating, and recent activity
2. **Rating Distribution**: Analyze feedback quality with visual charts
3. **Trend Analysis**: Track feedback patterns over time
4. **Recent Activity**: Monitor the latest feedback submissions

## 🔧 API Endpoints

### Chat Endpoints
- `POST /api/ask` - Send a question to AI and get response
- `GET /api/health` - Health check for all services

### Feedback Endpoints
- `POST /api/feedback` - Submit new feedback
- `GET /api/feedback` - Retrieve all feedback
- `DELETE /api/feedback/:id` - Delete specific feedback

### Health Check Response
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "mongodb": "connected",
    "apis": {
      "cohere": true,
      "openrouter": true,
      "google": true,
      "huggingface": false
    }
  }
}
```

## 🎨 User Interface Features

### Main Chat Interface
Beautiful, responsive chat interface with AI responses and real-time messaging

### Feedback Management
Comprehensive feedback collection and management system with advanced filtering

### Analytics Dashboard
Detailed analytics with visual charts and comprehensive metrics

### Mobile Responsive
Fully responsive design that works seamlessly on all devices

## 🚀 Deployment

### Deploy to Heroku
```bash
# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Add MongoDB Atlas addon (or use your own MongoDB)
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set COHERE_API_KEY=your_key_here
heroku config:set GOOGLE_API_KEY=your_key_here
# ... add other API keys

# Deploy
git push heroku main
```

### Deploy to Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Deploy Backend to Railway/Render
1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy with automatic builds

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
   ```bash
   git fork https://github.com/yourusername/ai-assistant-feedback-tracker.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests if applicable

4. **Commit Your Changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

5. **Push to Your Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes clearly
   - Include screenshots if UI changes
   - Reference any related issues

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```bash
# Check if MongoDB is running locally
sudo systemctl status mongod

# Or start MongoDB
sudo systemctl start mongod
```

#### API Key Issues
- Ensure API keys are correctly set in `.env` file
- Check API key validity and quotas
- Verify API endpoints are accessible

#### Port Already in Use
```bash
# Kill process using port 5000
sudo lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=5001 npm start
```

#### CORS Errors
- Ensure backend is running on correct port
- Check frontend API_BASE URL configuration
- Verify CORS settings in backend

## 🔮 Future Enhancements

- [ ] **User Authentication**: Login/signup functionality
- [ ] **Real-time Chat**: WebSocket integration for live updates
- [ ] **Voice Integration**: Speech-to-text and text-to-speech
- [ ] **File Uploads**: Support for document and image uploads
- [ ] **Chat History**: Persistent conversation history
- [ ] **Admin Dashboard**: Advanced admin controls and user management
- [ ] **Multi-language Support**: Internationalization (i18n)
- [ ] **API Rate Limiting**: Enhanced security and usage controls
- [ ] **Automated Testing**: Comprehensive test suite
- [ ] **Docker Support**: Containerization for easy deployment

## 💻 Development

### Code Structure
```
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── utils/       # Utility functions
│   │   └── App.js       # Main app component
│   └── public/          # Static assets
└── screenshots/         # Project screenshots
```

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `PORT` | Server port (default: 5000) | No |
| `COHERE_API_KEY` | Cohere AI API key | No* |
| `GOOGLE_API_KEY` | Google Gemini API key | No* |
| `OPENROUTER_API_KEY` | OpenRouter API key | No* |
| `HF_API_KEY` | Hugging Face API key | No* |

*At least one AI API key is required for chat functionality.

## 📞 Support

If you have any questions or issues, please:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/yourusername/ai-assistant-feedback-tracker/issues)
3. Create a new issue with detailed information
4. Join our [Discord Community](https://discord.gg/your-invite) for real-time help

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide](https://lucide.dev/) - Icons
- [Cohere](https://cohere.ai/) - AI API
- [Google AI](https://ai.google.dev/) - Gemini API
- [OpenRouter](https://openrouter.ai/) - AI API Gateway
- [Hugging Face](https://huggingface.co/) - ML Models

---

**Made with ❤️ by [Akshad Apastambh]**

*Don't forget to ⭐ star this repo if you found it useful!*
