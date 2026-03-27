const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم المنتج مطلوب'],
    trim: true,
    maxlength: [200, 'اسم المنتج يجب ألا يتجاوز 200 حرف']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'الوصف يجب ألا يتجاوز 1000 حرف']
  },
  sku: {
    type: String,
    unique: true,
    required: [true, 'رمز المنتج مطلوب'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'الفئة مطلوبة'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'السعر مطلوب'],
    min: [0, 'السعر يجب أن يكون أكبر من أو يساوي صفر']
  },
  costPrice: {
    type: Number,
    min: [0, 'سعر التكلفة يجب أن يكون أكبر من أو يساوي صفر']
  },
  quantity: {
    type: Number,
    required: [true, 'الكمية مطلوبة'],
    min: [0, 'الكمية يجب أن تكون أكبر من أو تساوي صفر'],
    default: 0
  },
  minQuantity: {
    type: Number,
    min: [0, 'الحد الأدنى للكمية يجب أن يكون أكبر من أو يساوي صفر'],
    default: 5
  },
  unit: {
    type: String,
    default: 'قطعة',
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: 'no-image.jpg'
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
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) return 'out_of_stock';
  if (this.quantity <= this.minQuantity) return 'low_stock';
  return 'in_stock';
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
