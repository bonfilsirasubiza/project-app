const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getSuppliers)
  .post(authorize('admin', 'manager'), createSupplier);

router.route('/:id')
  .get(getSupplierById)
  .put(authorize('admin', 'manager'), updateSupplier)
  .delete(authorize('admin'), deleteSupplier);

module.exports = router;