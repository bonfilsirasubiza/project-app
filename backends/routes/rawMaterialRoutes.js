const express = require('express');
const router = express.Router();
const {
  getRawMaterials,
  getRawMaterialById,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  getLowStockMaterials
} = require('../controllers/rawMaterialController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .get(getRawMaterials)
  .post(authorize('admin', 'manager'), createRawMaterial);

router.get('/low-stock', getLowStockMaterials);

router.route('/:id')
  .get(getRawMaterialById)
  .put(authorize('admin', 'manager'), updateRawMaterial)
  .delete(authorize('admin'), deleteRawMaterial);

module.exports = router;