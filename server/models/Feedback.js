// const mongoose = require('mongoose');

// const feedbackSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   message: { type: String, required: true },
//   rating: { type: Number, min: 1, max: 5 },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Feedback', feedbackSchema);

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

// Add indexes for better query performance
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ rating: 1 });

// Add a virtual for formatted date
feedbackSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Ensure virtual fields are included when converting to JSON
feedbackSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Feedback', feedbackSchema);