




const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const { uploadProfilePicture, uploadCompanyLogo, uploadMultiple, uploadFlexible, handleUploadError } = require('../middleware/upload');

const router = express.Router();




// @route   POST /api/auth/signup
// @desc    Register a new user or company
router.post('/signup', 
  // Handle flexible uploads (optional files)
  uploadFlexible,
  handleUploadError,
  // Registration logic
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

      // Check username uniqueness for users
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

      // Create new user/company
      const user = new User(userData);

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save to database
      await user.save();

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
          if (err) throw err;
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
      
      // Handle validation errors
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ msg: messages.join(', ') });
      }
      
      res.status(500).json({ msg: 'Server error during registration' });
    }
  }
);



// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

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
        if (err) throw err;
        res.json({ 
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
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_development');
    
    // Get user from database
    const user = await User.findById(decoded.user.id);
    
    if (!user) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        companyName: user.companyName,
        profilePicture: user.profilePicture,
        companyLogo: user.companyLogo,
        companyDescription: user.companyDescription,
        createdAt: user.createdAt,
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
