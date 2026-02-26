const express = require('express');
const router = express.Router();
const {
  getStockIn,
  createStockIn,
  getStockOut,
  createStockOut,
  getStockSummary
} = require('../controllers/stockController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Stock In routes
router.route('/stockin')
  .get(getStockIn)
  .post(authorize('admin', 'manager'), createStockIn);

// Stock Out routes
router.route('/stockout')
  .get(getStockOut)
  .post(authorize('admin', 'manager', 'staff'), createStockOut);

// Summary route
router.get('/summary', getStockSummary);

module.exports = router;