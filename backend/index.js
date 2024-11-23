const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const Message = require('./models/message');
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
      origin: "http://localhost:5173", // React client URL
      methods: ["GET", "POST"]
    }
  });

mongoose.connect('mongodb://localhost:27017/chat-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error', err);
});

app.use(cors());
app.use(bodyParser.json());

app.use('/api', chatRoutes);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('sendMessage', async (data) => {
    const { sender, content } = data;
    const message = new Message({ sender, content });

    try {
      await message.save();
      io.emit('receiveMessage', message);
    } catch (error) {
      console.error('Error saving message', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
