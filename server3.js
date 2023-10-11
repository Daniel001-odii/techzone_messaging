const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const routes = require('./routes/messageRoutes'); // Import your routes
const cors = require('cors');
const app = express();

const socketIO = require('socket.io');
const http = require('http');
const server = http.createServer(app);



// const io = socketIO(server);
// Export the io instance so it can be used in other files

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


var dbUrl = 'mongodb+srv://admin:admin@cluster0.3rg9h4v.mongodb.net/?retryWrites=true&w=majority'

// Database connection
mongoose.connect(dbUrl , function (err, db) {
  console.log('message database connected...',err);
  if(err) throw err;
})




// Routes
app.use('/api', routes);

// Socket.io integration
require('./controllers/socket')(io);

const PORT = process.env.PORT || 3000;


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
