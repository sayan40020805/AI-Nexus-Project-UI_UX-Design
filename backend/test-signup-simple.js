const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { uploadFlexible, handleUploadError } = require('./middleware/upload');

const app = express();

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
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:5175'
  ],
  credentials: true,
}));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route for signup
const testSignup = async (req, res) => {
  console.log('Test signup route hit');
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);

  const { role, username, email, password, companyName, companyDescription } = req.body;

  try {
    // Basic validation
    if (!role || !email || !password) {
      return res.status(400).json({ msg: 'Role, email, and password are required' });
    }

    if (role === 'user' && !username) {
      return res.status(400).json({ msg: 'Username is required for user registration' });
    }

    if (role === 'company' && !companyName) {
      return res.status(400).json({ msg: 'Company name is required for company registration' });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }

    // Password complexity check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ msg: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' });
    }

    // Check if user/company already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'An account with this email already exists' });
    }

    // Check username uniqueness for users (only if username is provided and not null)
    if (role === 'user' && username) {
      const existingUsername = await User.findOne({ username, role: 'user' });
      if (existingUsername) {
        return res.status(400).json({ msg: 'This username is already taken' });
      }
    }

    // Create user/company object based on role
    const userData = {
      email,
      password,
      role,
    };

    // Add role-specific fields
    if (role === 'user') {
      userData.username = username;
      if (req.files) {
        // Find profile picture file
        const profileFile = req.files.find(f => f.fieldname === 'profile-pic' || f.fieldname === 'profilePicture');
        if (profileFile) {
          userData.profilePicture = `/uploads/profiles/${profileFile.filename}`;
        }
      }
    } else if (role === 'company') {
      userData.companyName = companyName;
      if (companyDescription) {
        userData.companyDescription = companyDescription;
      }
      if (req.files) {
        // Find company logo file
        const logoFile = req.files.find(f => f.fieldname === 'company-logo' || f.fieldname === 'companyLogo');
        if (logoFile) {
          userData.companyLogo = `/uploads/companies/${logoFile.filename}`;
        }
      }
    }

    console.log('User data to create:', userData);

    // Create new user/company
    const user = new User(userData);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    console.log('Hashed password created, saving to database...');

    // Save to database
    await user.save();

    console.log('User saved successfully');

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret_key_for_development',
      { expiresIn: '5h' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json({ msg: 'Token generation failed' });
        }
        
        console.log('Token generated successfully');
        res.status(201).json({ 
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            username: user.username,
            companyName: user.companyName,
            profilePicture: user.profilePicture,
            companyLogo: user.companyLogo,
          }
        });
      }
    );
  } catch (err) {
    console.error('Registration error:', err.message);
    console.error('Full error:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ msg: messages.join(', ') });
    }
    
    res.status(500).json({ msg: 'Server error during registration' });
  }
};

// Apply upload middleware to handle file uploads
app.post('/api/auth/test-signup', uploadFlexible, handleUploadError, testSignup);

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

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Test server started on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Test signup endpoint: http://localhost:${PORT}/api/auth/test-signup`);
});
