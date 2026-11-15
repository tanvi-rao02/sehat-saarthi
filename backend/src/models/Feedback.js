const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type:       { type: String, enum: ['bug','suggestion','general'], default: 'general' },
  message:    { type: String, required: true, maxlength: 2000 },
  rating:     { type: Number, min: 1, max: 5 },
  isResolved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
