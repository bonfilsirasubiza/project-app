const mongoose = require('mongoose');

const stockOutSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawMaterial',
    required: [true, 'Material is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    enum: ['production', 'damage', 'sample', 'other']
  },
  department: {
    type: String,
    trim: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receivedBy: {
    type: String,
    trim: true
  },
  productionOrder: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
}, {
  timestamps: true
});

// Check if enough stock before issuing
stockOutSchema.pre('save', async function(next) {
  try {
    const RawMaterial = mongoose.model('RawMaterial');
    const material = await RawMaterial.findById(this.material);
    
    if (!material) {
      throw new Error('Material not found');
    }
    
    if (material.quantity < this.quantity) {
      throw new Error(`Insufficient stock. Available: ${material.quantity} ${material.unit}`);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Update material quantity after stock out
stockOutSchema.post('save', async function(doc) {
  try {
    const RawMaterial = mongoose.model('RawMaterial');
    await RawMaterial.findByIdAndUpdate(
      doc.material,
      { $inc: { quantity: -doc.quantity } }
    );
  } catch (error) {
    console.error('Error updating material quantity:', error);
  }
});

stockOutSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const StockOut = mongoose.model('StockOut', stockOutSchema);
module.exports = StockOut;
