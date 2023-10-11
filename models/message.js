// models/message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('Message', messageSchema);