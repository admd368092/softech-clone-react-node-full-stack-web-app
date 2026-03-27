const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم العميل مطلوب'],
    trim: true,
    maxlength: [200, 'اسم العميل يجب ألا يتجاوز 200 حرف']
  },
  email: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'البريد الإلكتروني غير صالح']
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    trim: true
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    governorate: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    }
  },
  taxNumber: {
    type: String,
    trim: true
  },
  customerType: {
    type: String,
    enum: ['individual', 'company'],
    default: 'individual'
  },
  creditLimit: {
    type: Number,
    min: [0, 'حد الائتمان يجب أن يكون أكبر من أو يساوي صفر'],
    default: 0
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
customerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for full address
customerSchema.virtual('fullAddress').get(function() {
  const parts = [];
  if (this.address.street) parts.push(this.address.street);
  if (this.address.city) parts.push(this.address.city);
  if (this.address.governorate) parts.push(this.address.governorate);
  if (this.address.postalCode) parts.push(this.address.postalCode);
  return parts.join('، ');
});

// Ensure virtual fields are serialized
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Customer', customerSchema);
