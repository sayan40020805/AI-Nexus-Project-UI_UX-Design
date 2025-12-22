const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

// Load environment variables
require('dotenv').config();

// Connect to Database
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// More restrictive limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs (more restrictive)
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);
app.use('/api/auth', authLimiter);


// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5176',
    'http://localhost:3000',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5176',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5175'
  ],
  credentials: true,
}));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory (allow cross-origin resource loading)
app.use('/uploads', (req, res, next) => {
  // Allow embedding/uploads to be loaded from frontend origins
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  next();
}, express.static(path.join(__dirname, 'uploads')));





// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5176',
      'http://localhost:3000',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5176',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5175'
    ],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  // Join user to their personal room for notifications
  socket.join(`user_${socket.userId}`);
  
  // Handle joining live stream rooms
  socket.on('join-stream', (sessionId) => {
    socket.join(`stream_${sessionId}`);
    console.log(`User ${socket.userId} joined stream ${sessionId}`);
  });
  
  // Handle leaving live stream rooms
  socket.on('leave-stream', (sessionId) => {
    socket.leave(`stream_${sessionId}`);
    console.log(`User ${socket.userId} left stream ${sessionId}`);
  });
  
  // Handle real-time messaging
  socket.on('send-message', async (data) => {
    try {
      const { recipientId, content } = data;
      
      // Create message in database
      const Message = require('./models/Message');
      const newMessage = new Message({
        participants: [socket.userId, recipientId],
        content,
        sender: socket.userId,
        recipient: recipientId
      });
      
      await newMessage.save();
      
      // Emit to both sender and recipient
      io.to(`user_${recipientId}`).emit('new-message', newMessage);
      io.to(`user_${socket.userId}`).emit('message-sent', newMessage);
      
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });
  
  // Handle live stream chat
  socket.on('stream-chat', async (data) => {
    try {
      const { sessionId, message } = data;
      
      // Save chat message to database
      const LiveSession = require('./models/LiveSession');
      const session = await LiveSession.findById(sessionId);
      
      if (session) {
        session.chatMessages.push({
          user: socket.userId,
          content: message
        });
        
        await session.save();
        
        // Broadcast to all stream viewers
        io.to(`stream_${sessionId}`).emit('stream-chat-message', {
          userId: socket.userId,
          message,
          timestamp: new Date()
        });
      }
      
    } catch (err) {
      console.error('Stream chat error:', err);
    }
  });
  
  // Handle post interactions
  socket.on('like-post', async (data) => {
    try {
      const { postId } = data;
      
      // Emit like update to all users who might be viewing this post
      socket.broadcast.emit('post-liked', {
        postId,
        userId: socket.userId
      });
      
    } catch (err) {
      console.error('Like post socket error:', err);
    }
  });
  
  socket.on('comment-post', async (data) => {
    try {
      const { postId, comment } = data;
      
      // Emit comment to all users viewing the post
      socket.broadcast.emit('post-commented', {
        postId,
        userId: socket.userId,
        comment,
        timestamp: new Date()
      });
      
    } catch (err) {
      console.error('Comment post socket error:', err);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Define Routes - Auth routes handle their own middleware
const authRouter = require('./routes/auth');
const companyRouter = require('./routes/company');
const userRouter = require('./routes/user');
const postsRouter = require('./routes/posts');
const searchRouter = require('./routes/search');
const followRouter = require('./routes/follow');
const feedRouter = require('./routes/feed');
const messagesRouter = require('./routes/messages');
const liveRouter = require('./routes/live');
const settingsRouter = require('./routes/settings');
const jobsRouter = require('./routes/jobs');
const jobApplicationsRouter = require('./routes/jobApplications');
const eventsRouter = require('./routes/events');
const eventRegistrationsRouter = require('./routes/eventRegistrations');

app.use('/api/auth', authRouter);
app.use('/api/company', companyRouter);
app.use('/api/user', userRouter);
app.use('/api/posts', postsRouter);
app.use('/api/search', searchRouter);
app.use('/api/follow', followRouter);
app.use('/api/feed', feedRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/live', liveRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/jobs', jobsRouter);
app.use('/api', jobApplicationsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/events', eventRegistrationsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    msg: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack } : undefined
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ msg: 'Route not found' });
});


const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Uploads served from: ${path.join(__dirname, 'uploads')}`);
  console.log(`Socket.IO enabled for real-time features`);
});

// Make io available to routes if needed
app.set('io', io);
