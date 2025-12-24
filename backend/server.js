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

// Rate limiting - More relaxed for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 100 to 1000 requests per windowMs for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// More restrictive limiter for auth endpoints (but still reasonable)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased from 10 to 50 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);
app.use('/api/auth', authLimiter);


// CORS configuration - Fixed for console error resolution
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
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
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Import models and services for Socket.IO
const User = require('./models/User');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const ChatService = require('./services/chatService');

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

// Socket.IO connection handling with enhanced chat functionality
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);

  // Join user to their personal room for notifications
  socket.join(`user_${socket.userId}`);

  // Handle chat room joining
  socket.on('joinRoom', async (data) => {
    try {
      const { conversationId } = data;
      
      if (conversationId) {
        socket.join(`conversation_${conversationId}`);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
      }
    } catch (err) {
      console.error('Join room error:', err);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle chat room leaving
  socket.on('leaveRoom', (data) => {
    try {
      const { conversationId } = data;
      
      if (conversationId) {
        socket.leave(`conversation_${conversationId}`);
        console.log(`User ${socket.userId} left conversation ${conversationId}`);
      }
    } catch (err) {
      console.error('Leave room error:', err);
    }
  });

  // Handle real-time messaging with enhanced features
  socket.on('sendMessage', async (data) => {
    try {
      const { receiverId, content, messageType = 'text' } = data;

      if (!receiverId || !content) {
        socket.emit('error', { message: 'Receiver ID and content are required' });
        return;
      }

      // Send message using ChatService
      const result = await ChatService.sendMessage(socket.userId, receiverId, content, messageType);
      
      const { message, conversation } = result;

      // Emit to sender (confirmation)
      socket.emit('messageSent', {
        message,
        conversation,
        status: 'sent'
      });

      // Emit to receiver
      io.to(`user_${receiverId}`).emit('newMessage', {
        message,
        conversation,
        status: 'delivered'
      });

      // Emit to conversation room for real-time updates
      io.to(`conversation_${conversation.conversationId}`).emit('receiveMessage', {
        message,
        conversation
      });

      console.log(`Message sent from ${socket.userId} to ${receiverId}`);

    } catch (err) {
      console.error('Send message error:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle message read status
  socket.on('messageRead', async (data) => {
    try {
      const { conversationId, messageId } = data;

      if (!conversationId) {
        socket.emit('error', { message: 'Conversation ID is required' });
        return;
      }

      const result = await ChatService.markMessagesAsRead(conversationId, socket.userId, messageId);

      // Emit read status to conversation participants
      io.to(`conversation_${conversationId}`).emit('messageRead', {
        conversationId,
        messageId,
        readBy: socket.userId,
        readAt: new Date().toISOString(),
        updatedCount: result.updatedCount
      });

    } catch (err) {
      console.error('Message read error:', err);
      socket.emit('error', { message: 'Failed to mark message as read' });
    }
  });

  // Handle typing indicators
  socket.on('typingStart', (data) => {
    try {
      const { conversationId, receiverId } = data;

      if (conversationId && receiverId) {
        // Emit to receiver that user is typing
        io.to(`user_${receiverId}`).emit('userTyping', {
          conversationId,
          userId: socket.userId,
          isTyping: true
        });

        // Emit to conversation room
        io.to(`conversation_${conversationId}`).emit('typingIndicator', {
          conversationId,
          userId: socket.userId,
          isTyping: true
        });
      }
    } catch (err) {
      console.error('Typing start error:', err);
    }
  });

  socket.on('typingStop', (data) => {
    try {
      const { conversationId, receiverId } = data;

      if (conversationId && receiverId) {
        // Emit to receiver that user stopped typing
        io.to(`user_${receiverId}`).emit('userTyping', {
          conversationId,
          userId: socket.userId,
          isTyping: false
        });

        // Emit to conversation room
        io.to(`conversation_${conversationId}`).emit('typingIndicator', {
          conversationId,
          userId: socket.userId,
          isTyping: false
        });
      }
    } catch (err) {
      console.error('Typing stop error:', err);
    }
  });

  // Handle user online/offline status
  socket.on('getOnlineUsers', async () => {
    try {
      // Get all connected users
      const connectedSockets = await io.in(`user_${socket.userId}`).fetchSockets();
      const onlineUsers = [];
      
      // For each room, check if user is online
      for (const [roomName, sockets] of io.sockets.adapter.rooms) {
        if (roomName.startsWith('user_') && roomName !== `user_${socket.userId}`) {
          const userId = roomName.replace('user_', '');
          onlineUsers.push(userId);
        }
      }

      socket.emit('onlineUsers', { onlineUsers });

    } catch (err) {
      console.error('Get online users error:', err);
    }
  });

  // Handle joining live stream rooms (existing functionality)
  socket.on('join-stream', (sessionId) => {
    socket.join(`stream_${sessionId}`);
    console.log(`User ${socket.userId} joined stream ${sessionId}`);
  });

  // Handle leaving live stream rooms (existing functionality)
  socket.on('leave-stream', (sessionId) => {
    socket.leave(`stream_${sessionId}`);
    console.log(`User ${socket.userId} left stream ${sessionId}`);
  });

  // Handle live stream chat (existing functionality)
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

  // Handle post interactions (existing functionality)
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
    
    // Notify others that user is offline
    socket.broadcast.emit('userOffline', {
      userId: socket.userId,
      timestamp: new Date().toISOString()
    });
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
const zegoRouter = require('./routes/zego');
const settingsRouter = require('./routes/settings');
const jobsRouter = require('./routes/jobs');
const jobApplicationsRouter = require('./routes/jobApplications');
const eventsRouter = require('./routes/events');

app.use('/api/auth', authRouter);
app.use('/api/company', companyRouter);
app.use('/api/user', userRouter);
app.use('/api/posts', postsRouter);
app.use('/api/search', searchRouter);
app.use('/api/follow', followRouter);
app.use('/api/feed', feedRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/chat', chatRouter); // New chat routes
app.use('/api/live', liveRouter);
app.use('/api/zego', zegoRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/jobs', jobsRouter);
app.use('/api', jobApplicationsRouter);
app.use('/api/events', eventsRouter);

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
  console.log(`Chat functionality integrated with enhanced real-time messaging`);
});

// Make io available to routes if needed
app.set('io', io);
