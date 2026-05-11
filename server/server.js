const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');
const startCronJobs = require('./utils/cronJobs');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketHandler(server);

// Start Cron Jobs
startCronJobs();

// Middleware
app.use(express.json());
app.use(cors({
  origin: function(origin, callback){
    return callback(null, true);
  },
  credentials: true
}));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Basic route
app.get('/', (req, res) => {
  res.send('MediCare Connect API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
