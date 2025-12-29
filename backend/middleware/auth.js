const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    console.log('🔐 Auth Middleware - Request started');
    console.log('🔐 Auth Middleware - Request URL:', req.originalUrl);
    console.log('🔐 Auth Middleware - Request method:', req.method);
    
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('🔐 Auth Middleware - Auth header present:', !!authHeader);
    console.log('🔐 Auth Middleware - Auth header starts with Bearer:', authHeader ? authHeader.startsWith('Bearer ') : false);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔐 Auth Middleware - No valid auth header, returning 401');
      return res.status(401).json({ msg: 'No token provided, authorization denied' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔐 Auth Middleware - Token extracted, length:', token ? token.length : 0);

    if (!token) {
      console.log('🔐 Auth Middleware - Empty token, returning 401');
      return res.status(401).json({ msg: 'No token provided, authorization denied' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_for_development';
    console.log('🔐 Auth Middleware - Using JWT secret (first 10 chars):', jwtSecret.substring(0, 10) + '...');
    
    // Verify token
    const decoded = jwt.verify(token, jwtSecret);
    console.log('🔐 Auth Middleware - Token verified successfully, user ID:', decoded.user.id);
    
    // Get user from database (exclude password)
    const userId = decoded.user?.id || decoded.id || decoded.userId;
    console.log('🔐 Auth Middleware - Extracted user ID:', userId);
    
    if (!userId) {
      console.log('🔐 Auth Middleware - No user ID in token, returning 401');
      return res.status(401).json({ msg: 'Invalid token structure' });
    }
    
    const user = await User.findById(userId).select('-password');
    console.log('🔐 Auth Middleware - User found:', !!user);
    
    if (!user) {
      console.log('🔐 Auth Middleware - User not found in database, returning 401');
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    console.log('🔐 Auth Middleware - User authenticated successfully:', user.username || user.companyName);
    
    // Add user to request object with consistent structure
    req.user = {
      ...user.toObject(),
      id: user._id.toString() // Ensure id field is always available
    };
    next();
  } catch (err) {
    console.error('🔐 Auth Middleware - Error details:', {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    
    if (err.name === 'TokenExpiredError') {
      console.log('🔐 Auth Middleware - Token expired');
      return res.status(401).json({ msg: 'Token has expired' });
    }
    
    if (err.name === 'JsonWebTokenError') {
      console.log('🔐 Auth Middleware - Invalid token format');
      return res.status(401).json({ msg: 'Invalid token format' });
    }
    
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to check for specific roles
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        msg: `Access denied. Required role(s): ${roles.join(', ')}` 
      });
    }

    next();
  };
};

// Middleware to allow only company users
const allowCompanyOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: 'Authentication required' });
  }

  if (req.user.role !== 'company') {
    return res.status(403).json({ 
      msg: 'Access denied. Only company accounts can perform this action.' 
    });
  }

  next();
};

// Middleware to allow both user and company
const allowUserOrCompany = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: 'Authentication required' });
  }

  if (!['user', 'company'].includes(req.user.role)) {
    return res.status(403).json({ 
      msg: 'Access denied. Only user and company accounts can perform this action.' 
    });
  }

  next();
};

// Middleware to check if user owns the resource
const ownershipMiddleware = (userField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication required' });
    }

    // Check if user owns the resource or is admin
    if (req.user.role === 'admin' || req.user.id.toString() === req.params[userField]) {
      return next();
    }

    res.status(403).json({ msg: 'Access denied. You can only access your own resources.' });
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  ownershipMiddleware,
  allowCompanyOnly,
  allowUserOrCompany
};
