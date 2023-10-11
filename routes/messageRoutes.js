const express = require('express');
const http = require('http');
const router = express.Router();
const Room = require('../models/rooms');
const Message = require('../models/message');
const setupSocketIO = require('../controllers/socket');
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with your server
const io = setupSocketIO(server);

// Create a new room when users initiate a chat
router.post('/create-room', async (req, res) => {
    try {
      const { userId, employerId } = req.body;

      // Generate a unique room name based on user and employer IDs
      const roomName = `${userId},${employerId}`;

      // Check if the room already exists
      const existingRoom = await Room.findOne({ name: roomName });

      if (existingRoom) {
        return res.status(400).json({ error: 'Room already exists' });
      }

      // Create a new room and store references to the user and employer
      const room = new Room({ name: roomName, user: userId, employer: employerId });
      await room.save();

      res.status(201).json({ room });
    } catch (error) {
      res.status(500).json({ error: 'Unable to create room' });
    }
  });



  // Get rooms for a user (user or employer)
router.get('/rooms/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
      const rooms = await Room.find({ $or: [{ user: userId }, { employer: userId }] });
      res.json({ rooms });
    } catch (error) {
      res.status(500).json({ error: 'Unable to fetch rooms' });
    }
  });



  // Route to get messages in a room
router.get('/room/:roomId/messages', async (req, res) => {
    try {
      const roomId = req.params.roomId;
      const messages = await Message.find({ room: roomId }).populate('user');
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ error: 'Unable to fetch messages' });
    }
  });




// Route to send a message
router.post('/room/:roomId/send-message', async (req, res) => {
    try {
      const roomId = req.params.roomId;
      const { text, userId } = req.body;

      // Create a new message
      const message = new Message({ text, user: userId, room: roomId });
      await message.save();

      // Emit the message to the room using Socket.io
      io.to(roomId).emit('message', message);

      res.status(201).json({ message });
    } catch (error) {
      console.error('Error sending message:', error); // Log the error
      res.status(500).json({ error: 'Unable to send message' });
    }
  });




module.exports = router;
