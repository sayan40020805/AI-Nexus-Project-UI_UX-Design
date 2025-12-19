
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { uploadFlexible, handleUploadError } = require('../middleware/upload');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ========================
// HELPERS
// ========================

// Generate JWT token
const generateToken = (user) => {
  const payload = {
    user: { 
      id: user.id, 
      role: user.role 
    }
  };


  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback_secret_key_for_development',
    { expiresIn: '24h' }
  );
};

// Return user data (exclude password)
const getUserData = (user) => {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    username: user.username,
    companyName: user.companyName,
    companyDescription: user.companyDescription,
    profilePicture: user.profilePicture,
    companyLogo: user.companyLogo,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// ========================
// LOGIN ROUTE
// ========================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }


    // Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    // Return success response
    res.json({
      token,
      user: getUserData(user)
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

// ========================
// GET CURRENT USER (ME)
// ========================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Return current user data
    res.json({
      user: getUserData(req.user)
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ msg: 'Server error getting user data' });
  }
});

// ========================
// LOGOUT ROUTE (CLIENT-SIDE ONLY)
// ========================
router.post('/logout', (req, res) => {
  // Since we're using JWT, logout is handled client-side
  // This endpoint exists for consistency but doesn't need server-side logic
  res.json({ msg: 'Logged out successfully' });
});

// ========================
// REFRESH TOKEN ROUTE
// ========================
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    // Generate new token
    const token = generateToken(req.user);

    res.json({
      token,
      user: getUserData(req.user)
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(500).json({ msg: 'Server error during token refresh' });
  }
});

// ==========================
// REGISTER (USER / COMPANY)
// ==========================
router.post(
  '/signup',
  uploadFlexible,
  handleUploadError,
  async (req, res) => {
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

      // Password complexity
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (password.length < 6 || !passwordRegex.test(password)) {
        return res.status(400).json({
          msg: 'Password must be at least 6 characters and include uppercase, lowercase, and number'
        });
      }

      // Email exists?
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: 'An account with this email already exists' });
      }

      // Username unique (user only)
      if (role === 'user') {
        const existingUsername = await User.findOne({ username, role: 'user' });
        if (existingUsername) {
          return res.status(400).json({ msg: 'This username is already taken' });
        }
      }

      // Create base user object
      const userData = {
        email,
        password,
        role,
      };

      // =====================
      // USER ROLE
      // =====================
      if (role === 'user') {
        userData.username = username;

        if (req.files && req.files['profile-pic']) {
          userData.profilePicture =
            `/uploads/profiles/${req.files['profile-pic'][0].filename}`;
        }
      }

      // =====================
      // COMPANY ROLE
      // =====================
      if (role === 'company') {
        userData.companyName = companyName;
        if (companyDescription) userData.companyDescription = companyDescription;

        if (req.files && req.files['company-logo']) {
          userData.companyLogo =
            `/uploads/companies/${req.files['company-logo'][0].filename}`;
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(password, salt);


      // Save user
      const user = new User(userData);
      await user.save();

      // Generate token and get user data
      const token = generateToken(user);
      const userResponse = getUserData(user);

      res.status(201).json({
        token,
        user: userResponse
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ msg: 'Server error during registration' });
    }
  }
);

module.exports = router;
