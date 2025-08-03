import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Star, Trash2, User, Bot, AlertCircle, CheckCircle, Sparkles, Zap, Heart, BarChart3, TrendingUp, Users, Calendar, Filter, Download, Search } from 'lucide-react';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({ name: '', message: '', rating: 5 });
  const [notification, setNotification] = useState(null);
  const [filterRating, setFilterRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const messagesEndRef = useRef(null);

  const API_BASE = 'http://localhost:5000/api';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeTab === 'feedback' || activeTab === 'analytics') {
      fetchFeedbacks();
    }
  }, [activeTab]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const askQuestion = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { 
      id: Date.now(), 
      text: inputMessage, 
      sender: 'user', 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: inputMessage })
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage = {
          id: Date.now() + 1,
          text: data.answer,
          sender: 'ai',
          timestamp: new Date(),
          model: data.model,
          provider: data.provider
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: `Sorry, I encountered an error: ${error.message}`,
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!feedbackForm.name.trim() || !feedbackForm.message.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackForm)
      });

      if (response.ok) {
        showNotification('Feedback submitted successfully! ✨');
        setFeedbackForm({ name: '', message: '', rating: 5 });
        fetchFeedbacks();
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      showNotification('Failed to submit feedback', 'error');
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`${API_BASE}/feedback`);
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      }
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
    }
  };

  const deleteFeedback = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/feedback/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('Feedback deleted successfully!');
        fetchFeedbacks();
      } else {
        throw new Error('Failed to delete feedback');
      }
    } catch (error) {
      showNotification('Failed to delete feedback', 'error');
    }
  };

  const exportFeedbacks = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Rating,Message,Date\n"
      + feedbacks.map(f => `"${f.name}",${f.rating},"${f.message.replace(/"/g, '""')}","${new Date(f.createdAt).toLocaleString()}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `feedback_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Feedback exported successfully!');
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 transition-all duration-200 ${
          i < rating 
            ? 'text-yellow-400 fill-current drop-shadow-sm' 
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400 hover:scale-110 transform' : ''}`}
        onClick={interactive ? () => onRate(i + 1) : undefined}
      />
    ));
  };

  // Filter and sort feedbacks
  const filteredFeedbacks = feedbacks
    .filter(feedback => {
      const matchesRating = filterRating === 'all' || feedback.rating === parseInt(filterRating);
      const matchesSearch = feedback.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           feedback.message.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRating && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest': return b.rating - a.rating;
        case 'lowest': return a.rating - b.rating;
        default: return 0;
      }
    });

  // Analytics calculations
  const totalFeedbacks = feedbacks.length;
  const averageRating = feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : '0';
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: feedbacks.filter(f => f.rating === rating).length,
    percentage: feedbacks.length > 0 ? Math.round((feedbacks.filter(f => f.rating === rating).length / feedbacks.length) * 100) : 0
  }));
  const recentFeedbacks = feedbacks.filter(f => new Date(f.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  
  // Calculate daily average more accurately
  const oldestFeedback = feedbacks.length > 0 ? feedbacks.reduce((oldest, current) => 
    new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest
  ) : null;
  
  const daysSinceFirst = oldestFeedback ? 
    Math.max(1, Math.ceil((Date.now() - new Date(oldestFeedback.createdAt).getTime()) / (1000 * 60 * 60 * 24))) : 1;
  
  const dailyAverage = feedbacks.length > 0 ? Math.round((feedbacks.length / daysSinceFirst) * 10) / 10 : 0;

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          >
            <Sparkles className="w-3 h-3 text-white opacity-30" />
          </div>
        ))}
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-3 rounded-xl shadow-2xl backdrop-blur-lg border border-white/20 flex items-center gap-2 transform transition-all duration-500 text-sm ${
          notification.type === 'success' 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="relative z-10 h-full flex flex-col p-4">
        <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="relative">
                <Bot className="w-12 h-12 text-white drop-shadow-lg" />
                <div className="absolute -top-1 -right-1">
                  <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-2 drop-shadow-2xl">
              AI Assistant & Feedback Tracker
            </h1>
            <p className="text-white/80 font-light">Experience the future of conversation and feedback management</p>
          </div>

          {/* Tabs */}
          <div className="flex mb-4 bg-white/10 backdrop-blur-xl rounded-xl p-1 shadow-2xl border border-white/20">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm ${
                activeTab === 'chat' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl transform scale-105' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>AI Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm ${
                activeTab === 'feedback' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-xl transform scale-105' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Feedback</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm ${
                activeTab === 'analytics' 
                  ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-xl transform scale-105' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">
            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="text-center text-white/60 h-full flex flex-col justify-center">
                      <div className="relative inline-block mb-4">
                        <Bot className="w-16 h-16 mx-auto text-white/40" />
                        <div className="absolute -top-1 -right-1 animate-ping">
                          <Sparkles className="w-6 h-6 text-yellow-400" />
                        </div>
                      </div>
                      <p className="font-light">Start a magical conversation!</p>
                      <p className="text-xs mt-1 text-white/40">Ask me anything ✨</p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 transition-all duration-500 transform ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.sender === 'ai' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        
                        <div className={`max-w-md px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 text-sm ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : message.isError
                            ? 'bg-red-500/20 text-red-200 border border-red-400/30'
                            : 'bg-white/15 text-white border border-white/20'
                        }`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                          {message.model && (
                            <div className="text-xs mt-2 opacity-70 flex items-center gap-1">
                              <Zap className="w-2 h-2" />
                              {message.provider} • {message.model.split('/').pop()}
                            </div>
                          )}
                          <div className="text-xs mt-1 opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>

                        {message.sender === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white/15 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce animation-delay-200"></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce animation-delay-400"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-white/10 p-4 bg-white/5">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                      placeholder="Type your message here..."
                      className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent text-white placeholder-white/50 transition-all duration-300 text-sm"
                      disabled={isLoading}
                    />
                    <button
                      onClick={askQuestion}
                      disabled={isLoading || !inputMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 font-semibold shadow-xl hover:scale-105 disabled:hover:scale-100 text-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex gap-4 p-4 h-full min-h-0">
                  {/* Feedback Form */}
                  <div className="w-1/3 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Heart className="text-pink-400 w-5 h-5" />
                    Submit Feedback
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 font-medium mb-2 text-sm">Your Name</label>
                      <input
                        type="text"
                        value={feedbackForm.name}
                        onChange={(e) => setFeedbackForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-white/50 transition-all duration-300 text-sm"
                        placeholder="Enter your name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 font-medium mb-2 text-sm">Rating</label>
                      <div className="flex gap-1">
                        {renderStars(feedbackForm.rating, true, (rating) => 
                          setFeedbackForm(prev => ({ ...prev, rating }))
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white/80 font-medium mb-2 text-sm">Your Feedback</label>
                      <textarea
                        value={feedbackForm.message}
                        onChange={(e) => setFeedbackForm(prev => ({ ...prev, message: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-white/50 transition-all duration-300 resize-none text-sm"
                        placeholder="Tell us about your experience..."
                      />
                    </div>
                    
                    <button
                      onClick={submitFeedback}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-semibold shadow-xl hover:scale-105 flex items-center justify-center gap-2 text-sm"
                    >
                      <Heart className="w-4 h-4" />
                      Submit Feedback
                    </button>
                  </div>
                </div>

                {/* Feedback Management */}
                <div className="w-2/3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex flex-col min-h-0">
                  <div className="flex-shrink-0 p-4 border-b border-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Star className="text-yellow-400 w-5 h-5" />
                        Feedback Management ({filteredFeedbacks.length})
                      </h3>
                      <button
                        onClick={exportFeedbacks}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 flex items-center gap-1 text-sm"
                      >
                        <Download className="w-3 h-3" />
                        Export CSV
                      </button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-2 top-2 text-white/50" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search feedback..."
                          className="pl-8 pr-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm w-48"
                        />
                      </div>
                      
                      <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value)}
                        className="px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                      >
                        <option value="all">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                      </select>
                      
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                      </select>
                    </div>
                  </div>

                  {/* Feedback List */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    {filteredFeedbacks.length === 0 ? (
                      <div className="text-center text-white/60 h-full flex flex-col justify-center">
                        <Sparkles className="w-12 h-12 mx-auto mb-3 text-white/40" />
                        <p className="text-sm">No feedback matches your filters!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredFeedbacks.map((feedback, index) => (
                          <div 
                            key={feedback._id} 
                            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 hover:bg-white/15 transition-all duration-300 transform hover:scale-105"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-white text-sm">{feedback.name}</h4>
                                <div className="flex gap-1 mt-1">
                                  {renderStars(feedback.rating)}
                                </div>
                              </div>
                              <button
                                onClick={() => deleteFeedback(feedback._id)}
                                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/20 transition-all duration-200"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-white/80 mb-2 leading-relaxed text-xs">{feedback.message}</p>
                            <p className="text-xs text-white/40">
                              {new Date(feedback.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-blue-400" />
                      <div>
                        <p className="text-2xl font-bold text-white">{totalFeedbacks}</p>
                        <p className="text-white/60 text-sm">Total Feedback</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <Star className="w-8 h-8 text-yellow-400" />
                      <div>
                        <p className="text-2xl font-bold text-white">{averageRating}</p>
                        <p className="text-white/60 text-sm">Average Rating</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-green-400" />
                      <div>
                        <p className="text-2xl font-bold text-white">{recentFeedbacks}</p>
                        <p className="text-white/60 text-sm">This Week</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-8 h-8 text-purple-400" />
                      <div>
                        <p className="text-2xl font-bold text-white">{dailyAverage}</p>
                        <p className="text-white/60 text-sm">Daily Average</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="text-green-400 w-5 h-5" />
                    Rating Distribution
                  </h3>
                  <div className="space-y-3">
                    {ratingDistribution.map(({ rating, count, percentage }) => (
                      <div key={rating} className="flex items-center gap-4">
                        <div className="flex items-center gap-2 w-20">
                          <span className="text-white text-sm">{rating}</span>
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        </div>
                        <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-20 text-right">
                          <span className="text-white text-sm">{count} ({percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Feedback Trends */}
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-blue-400 w-5 h-5" />
                    Recent Activity
                  </h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                    {feedbacks.length === 0 ? (
                      <div className="text-center text-white/60 py-8">
                        <Sparkles className="w-12 h-12 mx-auto mb-3 text-white/40" />
                        <p className="text-sm">No recent feedback activity</p>
                      </div>
                    ) : (
                      feedbacks.slice(0, 10).map((feedback) => (
                        <div key={feedback._id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{feedback.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{feedback.name}</p>
                              <p className="text-white/60 text-xs">{feedback.message.substring(0, 50)}...</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {renderStars(feedback.rating)}
                            </div>
                            <span className="text-white/60 text-xs">{new Date(feedback.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        select option {
          background: #1a1a2e;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default App;