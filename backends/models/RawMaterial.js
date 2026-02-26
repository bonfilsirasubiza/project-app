const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({
  materialCode: {
    type: String,
    required: [true, 'Material code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  materialName: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true
    // Removed enum to allow any unit like 'kg', 'pcs', 'liters' as in your form
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Price cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for total value
rawMaterialSchema.virtual('totalValue').get(function() {
  return (this.quantity || 0) * (this.unitPrice || 0);
});

// Method to check if low stock (using 10 as threshold as in your React component)
rawMaterialSchema.methods.isLowStock = function() {
  return (this.quantity || 0) < 10;
};

// Set toJSON to include virtuals
rawMaterialSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret.isActive;
    return ret;
  }
});

const RawMaterial = mongoose.model('RawMaterial', rawMaterialSchema);
module.exports = RawMaterial;