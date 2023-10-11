// models/room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: String,
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  created: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('Room', roomSchema);