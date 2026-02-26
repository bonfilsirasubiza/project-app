// backend/routes/auth.js

import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Private route (requires authentication)
router.get('/me', protect, getMe);

// Health check route (optional)
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;