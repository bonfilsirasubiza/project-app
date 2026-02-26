const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { supplierName: { $regex: search, $options: 'i' } },
        { supplierCode: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const suppliers = await Supplier.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Supplier.countDocuments(query);

    res.json({
      suppliers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    res.json(supplier);
  } catch (error) {
    console.error('Get supplier error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private
const createSupplier = async (req, res) => {
  try {
    const { supplierCode, supplierName, phoneNumber, email, address, contactPerson, taxId, paymentTerms, notes } = req.body;

    // Check if supplier code already exists
    const existingSupplier = await Supplier.findOne({ supplierCode });
    if (existingSupplier) {
      return res.status(400).json({ message: 'Supplier code already exists' });
    }

    const supplier = await Supplier.create({
      supplierCode,
      supplierName,
      phoneNumber,
      email,
      address,
      contactPerson,
      taxId,
      paymentTerms,
      notes
    });

    res.status(201).json(supplier);
  } catch (error) {
    console.error('Create supplier error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Check if supplier code is being changed and if it already exists
    if (req.body.supplierCode && req.body.supplierCode !== supplier.supplierCode) {
      const existingSupplier = await Supplier.findOne({ 
        supplierCode: req.body.supplierCode,
        _id: { $ne: supplier._id }
      });
      if (existingSupplier) {
        return res.status(400).json({ message: 'Supplier code already exists' });
      }
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedSupplier);
  } catch (error) {
    console.error('Update supplier error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete supplier (soft delete)
// @route   DELETE /api/suppliers/:id
// @access  Private
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Soft delete
    supplier.isActive = false;
    await supplier.save();

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};