const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// ========================
// GET USER/COMPANY SETTINGS
// ========================
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    
    const defaultSettings = {
      privacy: 'public',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      messaging: {
        allowDirectMessages: true,
        allowConnectionsOnly: false
      },
      profile: {
        showEmail: false,
        showPhone: false,
        showLocation: false
      }
    };
    
    res.json({
      settings: user?.settings || defaultSettings
    });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ msg: 'Server error getting settings' });
  }
});

// ========================
// UPDATE USER/COMPANY SETTINGS
// ========================
router.put('/', async (req, res) => {
  try {
    const { settings } = req.body;
    
    // Validate settings structure
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ msg: 'Invalid settings data' });
    }
    
    // Update user settings
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        settings,
        updatedAt: new Date()
      },
      { new: true, select: 'settings' }
    );

    res.json({ 
      msg: 'Settings updated successfully',
      settings: updatedUser.settings
    });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ msg: 'Server error updating settings' });
  }
});

// ========================
// RESET TO DEFAULT SETTINGS
// ========================
router.post('/reset', async (req, res) => {
  try {
    const defaultSettings = {
      privacy: 'public',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      messaging: {
        allowDirectMessages: true,
        allowConnectionsOnly: false
      },
      profile: {
        showEmail: false,
        showPhone: false,
        showLocation: false
      }
    };
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        settings: defaultSettings,
        updatedAt: new Date()
      },
      { new: true, select: 'settings' }
    );

    res.json({ 
      msg: 'Settings reset to defaults successfully',
      settings: updatedUser.settings
    });
  } catch (err) {
    console.error('Reset settings error:', err);
    res.status(500).json({ msg: 'Server error resetting settings' });
  }
});

module.exports = router;
