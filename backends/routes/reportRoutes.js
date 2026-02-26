const express = require('express');
const router = express.Router();
const {
  getDailyStockReport,
  getStockOutReport,
  getValuationReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication and admin/manager access
router.use(protect, authorize('admin', 'manager'));

router.get('/daily-stock', getDailyStockReport);
router.get('/stock-out', getStockOutReport);
router.get('/valuation', getValuationReport);

module.exports = router;