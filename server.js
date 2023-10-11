const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
var bodyParser = require('body-parser')


const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const Message = require('./models/message');
const Room = require('./models/room');

app.use(cors());
app.use(express.json())



// Connect to MongoDB
var dbUrl = 'mongodb+srv://admin:admin@cluster0.3rg9h4v.mongodb.net/?retryWrites=true&w=majority'
// var dbUrl = 'mongodb://127.0.0.1:27017/Techzone_full'
// Database connection
mongoose.connect(dbUrl , function (err, db) {
  console.log('message database connected...',err);
  if(err) throw err;
})


app.post('/api/rooms', async (req, res) => {
  try {
    const { name, employerId, userId } = req.body;
    // You can now use employerId and userId as needed when creating the room
    const room = await Room.create({ name, employerId, userId });
    res.status(201).json(room);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ error: 'Error creating room: ' + error.message });
  }
});



app.post('/api/messages', async (req, res) => {
  try {
    const { text, user, room } = req.body;
    const message = await Message.create({ text, user, room });
    io.to(room).emit('message', message);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Error sending message' });
    console.error('Error fetching messages:', error);
  }
});



// endpoint to find rooms for either users or employers using their unique ID
app.get('/api/rooms/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // You can query for rooms that match either the userId or employerId
    const rooms = await Room.find({ $or: [{ userId: id }, { employerId: id }] });
    res.status(200).json(rooms);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ error: 'Error fetching rooms' });
  }
});



// Add this route to fetch messages for a specific room by room ID
app.get('/api/messages/:roomId', async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const messages = await Message.find({ room: roomId });
    res.status(200).json(messages);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ error: 'Error fetching messages: ' + error.message });
  }
});











// Socket.io setup
io.on('connection', (socket) => {
  socket.on('join', (room) => {
    socket.join(room);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
