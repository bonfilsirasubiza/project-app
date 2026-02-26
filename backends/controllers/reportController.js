const RawMaterial = require('../models/RawMaterial');
const StockIn = require('../models/stockn');
const StockOut = require('../models/stockut');

// @desc    Get daily stock status report
// @route   GET /api/reports/daily-stock
// @access  Private
const getDailyStockReport = async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date ? new Date(date) : new Date();
    
    // Set start and end of the day
    const startOfDay = new Date(reportDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all active materials
    const materials = await RawMaterial.find({ isActive: true });

    // Get stock in for the day
    const stockInToday = await StockIn.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('material');

    // Get stock out for the day
    const stockOutToday = await StockOut.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('material');

    // Prepare report data
    const report = materials.map(material => {
      const stockInQuantity = stockInToday
        .filter(s => s.material?._id.toString() === material._id.toString())
        .reduce((sum, s) => sum + s.quantity, 0);

      const stockOutQuantity = stockOutToday
        .filter(s => s.material?._id.toString() === material._id.toString())
        .reduce((sum, s) => sum + s.quantity, 0);

      const openingBalance = material.quantity - stockInQuantity + stockOutQuantity;
      const closingBalance = material.quantity;

      return {
        materialCode: material.materialCode,
        materialName: material.materialName,
        unit: material.unit,
        openingBalance,
        stockIn: stockInQuantity,
        stockOut: stockOutQuantity,
        closingBalance,
        unitPrice: material.unitPrice,
        totalValue: closingBalance * material.unitPrice,
        status: closingBalance <= material.reorderLevel ? 'Low Stock' : 'Normal'
      };
    });

    // Calculate summary
    const summary = {
      totalMaterials: materials.length,
      totalStockIn: stockInToday.reduce((sum, s) => sum + s.quantity, 0),
      totalStockOut: stockOutToday.reduce((sum, s) => sum + s.quantity, 0),
      totalValue: report.reduce((sum, r) => sum + r.totalValue, 0),
      lowStockItems: report.filter(r => r.status === 'Low Stock').length
    };

    res.json({
      date: reportDate,
      report,
      summary
    });
  } catch (error) {
    console.error('Daily stock report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get stock out report
// @route   GET /api/reports/stock-out
// @access  Private
const getStockOutReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stockOuts = await StockOut.find(dateQuery)
      .populate('material', 'materialName materialCode unit')
      .populate('issuedBy', 'username')
      .sort({ date: -1 });

    // Group by purpose
    const byPurpose = {};
    stockOuts.forEach(item => {
      if (!byPurpose[item.purpose]) {
        byPurpose[item.purpose] = {
          count: 0,
          quantity: 0
        };
      }
      byPurpose[item.purpose].count++;
      byPurpose[item.purpose].quantity += item.quantity;
    });

    // Group by material
    const byMaterial = {};
    stockOuts.forEach(item => {
      const materialId = item.material?._id;
      if (!byMaterial[materialId]) {
        byMaterial[materialId] = {
          materialName: item.material?.materialName,
          unit: item.material?.unit,
          count: 0,
          quantity: 0
        };
      }
      byMaterial[materialId].count++;
      byMaterial[materialId].quantity += item.quantity;
    });

    res.json({
      period: { startDate, endDate },
      totalTransactions: stockOuts.length,
      totalQuantity: stockOuts.reduce((sum, s) => sum + s.quantity, 0),
      byPurpose: Object.values(byPurpose),
      byMaterial: Object.values(byMaterial),
      details: stockOuts
    });
  } catch (error) {
    console.error('Stock out report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get inventory valuation report
// @route   GET /api/reports/valuation
// @access  Private
const getValuationReport = async (req, res) => {
  try {
    const materials = await RawMaterial.find({ isActive: true });

    const valuation = materials.map(m => ({
      materialCode: m.materialCode,
      materialName: m.materialName,
      unit: m.unit,
      quantity: m.quantity,
      unitPrice: m.unitPrice,
      totalValue: m.quantity * m.unitPrice
    }));

    const summary = {
      totalMaterials: materials.length,
      totalQuantity: materials.reduce((sum, m) => sum + m.quantity, 0),
      totalValue: valuation.reduce((sum, v) => sum + v.totalValue, 0),
      averageValuePerMaterial: valuation.length > 0 
        ? valuation.reduce((sum, v) => sum + v.totalValue, 0) / valuation.length 
        : 0
    };

    res.json({
      valuation,
      summary
    });
  } catch (error) {
    console.error('Valuation report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDailyStockReport,
  getStockOutReport,
  getValuationReport
};