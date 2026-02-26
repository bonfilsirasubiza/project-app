const RawMaterial = require('../models/RawMaterial');

// @desc    Get all raw materials
// @route   GET /api/raw-materials
// @access  Private
const getRawMaterials = async (req, res) => {
  try {
    const materials = await RawMaterial.find({ isActive: true })
      .sort({ createdAt: -1 });
    
    // Return directly as array for React frontend
    res.json(materials);
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single raw material
// @route   GET /api/raw-materials/:id
// @access  Private
const getRawMaterialById = async (req, res) => {
  try {
    const material = await RawMaterial.findById(req.params.id);
    
    if (!material || !material.isActive) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    res.json(material);
  } catch (error) {
    console.error('Get material error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create raw material
// @route   POST /api/raw-materials
// @access  Private
const createRawMaterial = async (req, res) => {
  try {
    const { materialCode, materialName, unit, quantity, unitPrice } = req.body;

    // Validate required fields
    if (!materialCode || !materialName || !unit || quantity === undefined || !unitPrice) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if material code already exists
    const existingMaterial = await RawMaterial.findOne({ 
      materialCode: materialCode.toUpperCase(),
      isActive: true 
    });
    
    if (existingMaterial) {
      return res.status(400).json({ message: 'Material code already exists' });
    }

    const material = await RawMaterial.create({
      materialCode: materialCode.toUpperCase(),
      materialName: materialName.trim(),
      unit: unit.trim(),
      quantity: Number(quantity) || 0,
      unitPrice: Number(unitPrice) || 0
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('Create material error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map(err => err.message).join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update raw material
// @route   PUT /api/raw-materials/:id
// @access  Private
const updateRawMaterial = async (req, res) => {
  try {
    const { materialCode, materialName, unit, quantity, unitPrice } = req.body;
    
    const material = await RawMaterial.findById(req.params.id);

    if (!material || !material.isActive) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check if material code is being changed and if it already exists
    if (materialCode && materialCode.toUpperCase() !== material.materialCode) {
      const existingMaterial = await RawMaterial.findOne({ 
        materialCode: materialCode.toUpperCase(),
        isActive: true,
        _id: { $ne: material._id }
      });
      
      if (existingMaterial) {
        return res.status(400).json({ message: 'Material code already exists' });
      }
    }

    // Update fields
    material.materialCode = materialCode ? materialCode.toUpperCase() : material.materialCode;
    material.materialName = materialName ? materialName.trim() : material.materialName;
    material.unit = unit ? unit.trim() : material.unit;
    material.quantity = quantity !== undefined ? Number(quantity) : material.quantity;
    material.unitPrice = unitPrice !== undefined ? Number(unitPrice) : material.unitPrice;

    const updatedMaterial = await material.save();

    res.json(updatedMaterial);
  } catch (error) {
    console.error('Update material error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map(err => err.message).join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete raw material (soft delete)
// @route   DELETE /api/raw-materials/:id
// @access  Private
const deleteRawMaterial = async (req, res) => {
  try {
    const material = await RawMaterial.findById(req.params.id);

    if (!material || !material.isActive) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Soft delete
    material.isActive = false;
    await material.save();

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get low stock materials (quantity < 10)
// @route   GET /api/raw-materials/low-stock
// @access  Private
const getLowStockMaterials = async (req, res) => {
  try {
    const materials = await RawMaterial.find({ 
      isActive: true,
      quantity: { $lt: 10 }
    }).sort({ quantity: 1 });
    
    res.json(materials);
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRawMaterials,
  getRawMaterialById,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  getLowStockMaterials
};