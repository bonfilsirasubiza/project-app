const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');

// @desc    Register a new user (disabled for this project)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  res.status(403).json({ message: 'Registration is disabled. Use the admin login.' });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const allowedEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const allowedPassword = process.env.ADMIN_PASSWORD || '123456';
    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedAllowedEmail = allowedEmail.trim().toLowerCase();

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Only allow admin login
    if (normalizedEmail !== normalizedAllowedEmail) {
      return res.status(401).json({ message: 'Only admin login is allowed' });
    }

    // Find user
    let user = await User.findOne({ email: normalizedAllowedEmail }).select('+password');

    if (!user) {
      if (password !== allowedPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      user = await User.create({
        username: 'Admin',
        email: normalizedAllowedEmail,
        password: allowedPassword,
        role: 'admin'
      });
      user = await User.findById(user._id).select('+password');
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated. Contact administrator.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role
        },
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  logoutUser
};
