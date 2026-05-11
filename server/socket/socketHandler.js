const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  // Global access to io
  global.io = io;

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Join a room specific to the user for direct notifications
    socket.join(`user_${socket.user.id}`);

    // Join video room for appointments
    socket.on('join_video_room', (appointmentId) => {
      socket.join(`video_${appointmentId}`);
      console.log(`User joined video room: video_${appointmentId}`);
    });

    // Chat functionality
    socket.on('send_message', async (data) => {
      try {
        // data = { receiverId, message }
        const newMessage = new Message({
          senderId: socket.user.id,
          receiverId: data.receiverId,
          message: data.message
        });
        
        await newMessage.save();

        // Emit to the receiver's room
        io.to(`user_${data.receiverId}`).emit('receive_message', newMessage);
        // Also emit to sender to update their UI (if they have multiple tabs open)
        io.to(`user_${socket.user.id}`).emit('receive_message', newMessage);

      } catch (error) {
        console.error('Socket message error:', error);
      }
    });

    socket.on('typing', (data) => {
      io.to(`user_${data.receiverId}`).emit('user_typing', { senderId: socket.user.id });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

module.exports = socketHandler;
