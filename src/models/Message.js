const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  messageId: {
    type: String,
    required: true,
    unique: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'sticker', 'location', 'contact', 'unknown'],
    default: 'text',
  },
  mediaUrl: {
    type: String,
    default: null,
  },
  mimetype: {
    type: String,
    default: null,
  },
  isFromMe: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
messageSchema.index({ sessionId: 1, timestamp: -1 });
messageSchema.index({ from: 1, to: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
