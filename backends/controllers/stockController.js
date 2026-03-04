const StockIn = require('../models/stockn');
const StockOut = require('../models/stockut');
const RawMaterial = require('../models/RawMaterial');

// @desc    Get all stock in records
// @route   GET /api/stock/stockin
// @access  Private
const getStockIn = async (req, res) => {
  try {
    const { startDate, endDate, materialId, supplierId, page = 1, limit = 10 } = req.query;
    
    let query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (materialId) {
      query.material = materialId;
    }

    if (supplierId) {
      query.supplier = supplierId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const stockIns = await StockIn.find(query)
      .populate('material', 'materialName materialCode unit')
      .populate('supplier', 'supplierName supplierCode')
      .populate('receivedBy', 'username')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StockIn.countDocuments(query);

    res.json({
      stockIns,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get stock in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create stock in record
// @route   POST /api/stock/stockin
// @access  Private
const createStockIn = async (req, res) => {
  try {
    const { material, supplier, quantity, unitPrice, date, invoiceNumber, notes } = req.body;

    // Validate material exists
    const materialExists = await RawMaterial.findById(material);
    if (!materialExists) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const stockIn = await StockIn.create({
      material,
      supplier,
      quantity,
      unitPrice,
      date,
      invoiceNumber,
      receivedBy: req.user._id,
      notes
    });

    const populatedStockIn = await StockIn.findById(stockIn._id)
      .populate('material', 'materialName materialCode unit')
      .populate('supplier', 'supplierName supplierCode')
      .populate('receivedBy', 'username');

    res.status(201).json(populatedStockIn);
  } catch (error) {
    console.error('Create stock in error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all stock out records
// @route   GET /api/stock/stockout
// @access  Private
const getStockOut = async (req, res) => {
  try {
    const { startDate, endDate, materialId, purpose, page = 1, limit = 10 } = req.query;
    
    let query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (materialId) {
      query.material = materialId;
    }

    if (purpose) {
      query.purpose = purpose;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const stockOuts = await StockOut.find(query)
      .populate('material', 'materialName materialCode unit')
      .populate('issuedBy', 'username')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StockOut.countDocuments(query);

    res.json({
      stockOuts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get stock out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create stock out record
// @route   POST /api/stock/stockout
// @access  Private
const createStockOut = async (req, res) => {
  try {
    const { material, quantity, date, purpose, department, productionOrder, receivedBy, notes } = req.body;

    // Validate material exists and has enough stock
    const materialExists = await RawMaterial.findById(material);
    if (!materialExists) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (quantity === undefined || Number(quantity) <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    if (materialExists.quantity < Number(quantity)) {
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${materialExists.quantity} ${materialExists.unit}` 
      });
    }

    const stockOut = await StockOut.create({
      material,
      quantity: Number(quantity),
      date,
      purpose,
      department,
      productionOrder,
      receivedBy,
      issuedBy: req.user._id,
      notes
    });

    const populatedStockOut = await StockOut.findById(stockOut._id)
      .populate('material', 'materialName materialCode unit')
      .populate('issuedBy', 'username');

    res.status(201).json(populatedStockOut);
  } catch (error) {
    console.error('Create stock out error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message && error.message.includes('Insufficient stock')) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message && error.message.includes('Material not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get stock transaction summary
// @route   GET /api/stock/summary
// @access  Private
const getStockSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Get stock in summary
    const stockInSummary = await StockIn.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$quantity" },
          totalValue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get stock out summary
    const stockOutSummary = await StockOut.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$quantity" },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      stockIn: stockInSummary[0] || { totalQuantity: 0, totalValue: 0, count: 0 },
      stockOut: stockOutSummary[0] || { totalQuantity: 0, count: 0 }
    });
  } catch (error) {
    console.error('Get stock summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStockIn,
  createStockIn,
  getStockOut,
  createStockOut,
  getStockSummary
};
