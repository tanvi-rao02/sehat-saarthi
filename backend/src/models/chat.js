const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, default: 'New Chat', maxlength: 100 },
  lastMessage:  { type: String, default: '' },
  isPinned:     { type: Boolean, default: false },
  messageCount: { type: Number, default: 0 },
}, { timestamps: true });

chatSchema.index({ user: 1, updatedAt: -1 });
module.exports = mongoose.model('Chat', chatSchema);
