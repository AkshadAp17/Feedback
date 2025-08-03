// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import './App.css';

// function App() {
//   const [feedbacks, setFeedbacks] = useState([]);
//   const [name, setName] = useState('');
//   const [message, setMessage] = useState('');
//   const [rating, setRating] = useState(5);
//   const [question, setQuestion] = useState('');
//   const [answer, setAnswer] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     fetchFeedbacks();
//   }, []);

//   const fetchFeedbacks = async () => {
//     try {
//       const { data } = await axios.get('http://localhost:5000/api/feedback');
//       setFeedbacks(data);
//     } catch (error) {
//       console.error('Error fetching feedbacks:', error);
//     }
//   };

//   const submitFeedback = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post('http://localhost:5000/api/feedback', { name, message, rating });
//       setName('');
//       setMessage('');
//       setRating(5);
//       fetchFeedbacks();
//     } catch (error) {
//       console.error('Error submitting feedback:', error);
//     }
//   };

//   const askQuestion = async () => {
//     if (!question.trim()) return;
    
//     setIsLoading(true);
//     try {
//       const { data } = await axios.post('http://localhost:5000/api/ask', { question });
//       setAnswer(data.answer);
//     } catch (error) {
//       console.error('Error asking question:', error);
//       setAnswer('Sorry, I could not answer that question.');
//     }
//     setIsLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl font-bold text-center mb-8">Feedback Tracker</h1>
        
//         <div className="grid md:grid-cols-2 gap-8">
//           {/* Feedback Form */}
//           <div className="bg-white p-6 rounded-lg shadow">
//             <h2 className="text-xl font-semibold mb-4">Submit Feedback</h2>
//             <form onSubmit={submitFeedback}>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1">Name</label>
//                 <input
//                   type="text"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="w-full p-2 border rounded"
//                   required
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1">Message</label>
//                 <textarea
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   className="w-full p-2 border rounded"
//                   required
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
//                 <select
//                   value={rating}
//                   onChange={(e) => setRating(Number(e.target.value))}
//                   className="w-full p-2 border rounded"
//                 >
//                   {[1, 2, 3, 4, 5].map((num) => (
//                     <option key={num} value={num}>{num}</option>
//                   ))}
//                 </select>
//               </div>
//               <button
//                 type="submit"
//                 className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
//               >
//                 Submit Feedback
//               </button>
//             </form>
//           </div>

//           {/* LLM Question Section */}
//           <div className="bg-white p-6 rounded-lg shadow">
//             <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>
//             <div className="mb-4">
//               <input
//                 type="text"
//                 value={question}
//                 onChange={(e) => setQuestion(e.target.value)}
//                 onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
//                 placeholder="Ask anything..."
//                 className="w-full p-2 border rounded"
//               />
//             </div>
//             <button
//               onClick={askQuestion}
//               disabled={isLoading || !question.trim()}
//               className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
//             >
//               {isLoading ? 'Thinking...' : 'Ask'}
//             </button>
//             {answer && (
//               <div className="mt-4 p-3 bg-gray-50 rounded">
//                 <p className="font-medium">Answer:</p>
//                 <p>{answer}</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Feedback List */}
//         <div className="mt-8 bg-white p-6 rounded-lg shadow">
//           <h2 className="text-xl font-semibold mb-4">Recent Feedback</h2>
//           {feedbacks.length === 0 ? (
//             <p>No feedback yet.</p>
//           ) : (
//             <ul className="space-y-4">
//               {feedbacks.map((feedback) => (
//                 <li key={feedback._id} className="border-b pb-2">
//                   <div className="flex justify-between">
//                     <span className="font-medium">{feedback.name}</span>
//                     <span className="text-yellow-500">{'★'.repeat(feedback.rating)}</span>
//                   </div>
//                   <p className="text-gray-600">{feedback.message}</p>
//                   <p className="text-sm text-gray-400">
//                     {new Date(feedback.createdAt).toLocaleString()}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [serverHealth, setServerHealth] = useState(null);

  useEffect(() => {
    checkServerHealth();
    fetchFeedbacks();
  }, []);

  const checkServerHealth = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/health`);
      setServerHealth(data);
      console.log('Server health:', data);
    } catch (error) {
      console.error('Server health check failed:', error);
      setServerHealth({ status: 'ERROR', mongodb: 'unknown' });
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/feedback`);
      setFeedbacks(data);
      setError('');
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError('Failed to load feedbacks. Please check if the server is running.');
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${API_BASE_URL}/api/feedback`, { 
        name: name.trim(), 
        message: message.trim(), 
        rating 
      });
      
      // Reset form
      setName('');
      setMessage('');
      setRating(5);
      setSuccess('Feedback submitted successfully!');
      
      // Refresh feedbacks
      await fetchFeedbacks();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit feedback. Please try again.';
      setError(errorMessage);
    }
    setIsSubmitting(false);
  };

  const askQuestion = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setAnswer('');

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/ask`, { 
        question: question.trim() 
      }, {
        timeout: 45000 // 45 second timeout
      });
      
      setAnswer(data.answer);
      console.log('AI Response from:', data.model);
    } catch (error) {
      console.error('Error asking question:', error);
      
      let errorMessage = 'Sorry, I could not answer that question.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The AI is taking too long to respond. Please try again.';
      } else if (error.response?.status === 500) {
        errorMessage = error.response?.data?.error || 'The AI service is currently unavailable. Please try again later.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || 'Please check your question and try again.';
      }
      
      setAnswer(errorMessage);
    }
    setIsLoading(false);
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/feedback/${id}`);
      setSuccess('Feedback deleted successfully!');
      await fetchFeedbacks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setError('Failed to delete feedback. Please try again.');
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          Feedback Tracker & AI Assistant
        </h1>
        
        {/* Server Status */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            serverHealth?.status === 'OK' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              serverHealth?.status === 'OK' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            Server: {serverHealth?.status || 'Unknown'} | 
            DB: {serverHealth?.mongodb === 'connected' ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearMessages} className="text-red-500 hover:text-red-700 font-bold">×</button>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded flex justify-between items-center">
            <span>{success}</span>
            <button onClick={clearMessages} className="text-green-500 hover:text-green-700 font-bold">×</button>
          </div>
        )}
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Feedback Form */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Submit Feedback</h2>
            <form onSubmit={submitFeedback}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  maxLength={100}
                  placeholder="Enter your name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  rows={4}
                  maxLength={500}
                  placeholder="Share your feedback..."
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {message.length}/500
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700">Rating</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                  <span className="text-yellow-500 text-xl">
                    {'★'.repeat(rating)}{'☆'.repeat(5-rating)}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !message.trim()}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : 'Submit Feedback'}
              </button>
            </form>
          </div>

          {/* AI Question Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Ask AI Assistant</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">Your Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), askQuestion())}
                placeholder="Ask me anything... (Press Enter to submit)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {question.length}/500
              </div>
            </div>
            <button
              onClick={askQuestion}
              disabled={isLoading || !question.trim()}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium mb-4"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Thinking...
                </span>
              ) : 'Ask AI'}
            </button>
            
            {answer && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-l-4 border-green-500">
                <p className="font-medium text-gray-800 mb-2">AI Response:</p>
                <p className="text-gray-700 leading-relaxed">{answer}</p>
              </div>
            )}
          </div>
        </div>

        {/* Feedback List */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Recent Feedback</h2>
            <button
              onClick={fetchFeedbacks}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              Refresh
            </button>
          </div>
          
          {feedbacks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No feedback yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div key={feedback._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-800">{feedback.name}</span>
                      <span className="text-yellow-500 text-lg">
                        {'★'.repeat(feedback.rating)}{'☆'.repeat(5-feedback.rating)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">
                        {new Date(feedback.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => deleteFeedback(feedback._id)}
                        className="text-red-500 hover:text-red-700 font-bold text-sm px-2 py-1 rounded hover:bg-red-50"
                        title="Delete feedback"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{feedback.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;