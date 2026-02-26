const mongoose = require('mongoose');

const stockInSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RawMaterial',
    required: [true, 'Material is required']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Price cannot be negative']
  },
  totalAmount: {
    type: Number,
    min: 0
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  invoiceNumber: {
    type: String,
    trim: true
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
stockInSchema.pre('save', function() {
  this.totalAmount = this.quantity * this.unitPrice;
});

// Update material quantity after stock in
stockInSchema.post('save', async function(doc) {
  try {
    const RawMaterial = mongoose.model('RawMaterial');
    await RawMaterial.findByIdAndUpdate(
      doc.material,
      { $inc: { quantity: doc.quantity } }
    );
  } catch (error) {
    console.error('Error updating material quantity:', error);
  }
});

stockInSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const StockIn = mongoose.model('StockIn', stockInSchema);
module.exports = StockIn;
