const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierCode: {
    type: String,
    required: [true, 'Supplier code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  supplierName: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  address: {
    type: String,
    trim: true
  },
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  taxId: {
    type: String,
    trim: true
  },
  paymentTerms: {
    type: String,
    enum: ['cash', 'credit_7days', 'credit_15days', 'credit_30days'],
    default: 'cash'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

supplierSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;