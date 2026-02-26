const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  loginUser,
  getMe,
  updateProfile,
  logoutUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/login', loginValidation, loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logoutUser);

module.exports = router;
