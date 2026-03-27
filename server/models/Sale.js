const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'المنتج مطلوب']
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'الكمية مطلوبة'],
    min: [1, 'الكمية يجب أن تكون 1 على الأقل']
  },
  unitPrice: {
    type: Number,
    required: [true, 'سعر الوحدة مطلوب'],
    min: [0, 'السعر يجب أن يكون أكبر من أو يساوي صفر']
  },
  discount: {
    type: Number,
    min: [0, 'الخصم يجب أن يكون أكبر من أو يساوي صفر'],
    default: 0
  },
  total: {
    type: Number,
    required: true
  }
});

const saleSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'العميل مطلوب']
  },
  customerName: {
    type: String,
    required: true
  },
  items: [saleItemSchema],
  subtotal: {
    type: Number,
    min: [0, 'المجموع الفرعي يجب أن يكون أكبر من أو يساوي صفر']
  },
  discount: {
    type: Number,
    min: [0, 'الخصم يجب أن يكون أكبر من أو يساوي صفر'],
    default: 0
  },
  tax: {
    type: Number,
    min: [0, 'الضريبة يجب أن تكون أكبر من أو تساوي صفر'],
    default: 0
  },
  total: {
    type: Number,
    min: [0, 'الإجمالي يجب أن يكون أكبر من أو يساوي صفر']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'credit'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'partial', 'cancelled'],
    default: 'pending'
  },
  amountPaid: {
    type: Number,
    min: [0, 'المبلغ المدفوع يجب أن يكون أكبر من أو يساوي صفر'],
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  saleDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Generate invoice number before saving
saleSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const count = await mongoose.model('Sale').countDocuments();
    this.invoiceNumber = `INV-${year}${month}${day}-${String(count + 1).padStart(5, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Calculate totals before saving
saleSchema.pre('save', function(next) {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate total
  this.total = this.subtotal - this.discount + this.tax;
  
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
