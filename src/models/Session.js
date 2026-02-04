const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['disconnected', 'connecting', 'connected', 'qr_code', 'authenticated'],
    default: 'disconnected',
  },
  phoneNumber: {
    type: String,
    default: null,
  },
  qrCode: {
    type: String,
    default: null,
  },
  qrCodeUrl: {
    type: String,
    default: null,
  },
  lastConnected: {
    type: Date,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
