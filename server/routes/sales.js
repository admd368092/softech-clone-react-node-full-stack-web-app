const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/sales
// @desc    Get all sales
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { customer, paymentStatus, startDate, endDate, sort } = req.query;
    
    // Build query
    let query = {};
    
    if (customer) query.customer = customer;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }

    // Build sort
    let sortOption = { saleDate: -1 };
    if (sort === 'date') sortOption = { saleDate: -1 };
    if (sort === 'total') sortOption = { total: -1 };
    if (sort === 'invoice') sortOption = { invoiceNumber: 1 };

    const sales = await Sale.find(query)
      .populate('customer', 'name phone')
      .populate('createdBy', 'name')
      .sort(sortOption);

    res.json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   GET /api/sales/:id
// @desc    Get single sale
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name phone email address')
      .populate('createdBy', 'name');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'الفاتورة غير موجودة'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   POST /api/sales
// @desc    Create new sale
// @access  Private
router.post('/', [
  protect,
  body('customer').notEmpty().withMessage('العميل مطلوب'),
  body('items').isArray({ min: 1 }).withMessage('يجب إضافة منتج واحد على الأقل'),
  body('items.*.product').notEmpty().withMessage('المنتج مطلوب'),
  body('items.*.quantity').isNumeric().withMessage('الكمية يجب أن تكون رقماً'),
  body('items.*.unitPrice').isNumeric().withMessage('سعر الوحدة يجب أن يكون رقماً')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { customer, items, discount, tax, paymentMethod, notes } = req.body;

    // Verify customer exists
    const customerDoc = await Customer.findById(customer);
    if (!customerDoc) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }

    // Process items and check stock
    const processedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `المنتج ${item.product} غير موجود`
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `الكمية المطلوبة من ${product.name} غير متوفرة في المخزون`
        });
      }

      // Calculate item total
      const itemTotal = (item.quantity * item.unitPrice) - (item.discount || 0);

      processedItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        total: itemTotal
      });

      // Update product stock
      product.quantity -= item.quantity;
      await product.save();
    }

    // Create sale
    const sale = await Sale.create({
      customer,
      customerName: customerDoc.name,
      items: processedItems,
      discount: discount || 0,
      tax: tax || 0,
      paymentMethod: paymentMethod || 'cash',
      notes,
      createdBy: req.user.id
    });

    // Update customer balance if credit sale
    if (paymentMethod === 'credit') {
      customerDoc.currentBalance += sale.total;
      await customerDoc.save();
    }

    res.status(201).json({
      success: true,
      data: sale
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   PUT /api/sales/:id
// @desc    Update sale
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'الفاتورة غير موجودة'
      });
    }

    // Only allow updates to pending sales
    if (sale.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تعديل فاتورة مدفوعة'
      });
    }

    sale = await Sale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: sale
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   PUT /api/sales/:id/payment
// @desc    Update sale payment status
// @access  Private
router.put('/:id/payment', protect, async (req, res) => {
  try {
    const { paymentStatus, amountPaid } = req.body;
    
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'الفاتورة غير موجودة'
      });
    }

    sale.paymentStatus = paymentStatus;
    if (amountPaid !== undefined) {
      sale.amountPaid = amountPaid;
    }

    await sale.save();

    res.json({
      success: true,
      data: sale
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   DELETE /api/sales/:id
// @desc    Delete sale
// @access  Private
router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'الفاتورة غير موجودة'
      });
    }

    // Restore product stock
    for (const item of sale.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
    }

    // Update customer balance if credit sale
    if (sale.paymentMethod === 'credit') {
      const customer = await Customer.findById(sale.customer);
      if (customer) {
        customer.currentBalance -= sale.total;
        await customer.save();
      }
    }

    await sale.deleteOne();

    res.json({
      success: true,
      message: 'تم حذف الفاتورة بنجاح'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   GET /api/sales/stats/overview
// @desc    Get sales statistics
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.saleDate = {};
      if (startDate) dateFilter.saleDate.$gte = new Date(startDate);
      if (endDate) dateFilter.saleDate.$lte = new Date(endDate);
    }

    const totalSales = await Sale.countDocuments(dateFilter);
    const totalRevenue = await Sale.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const paidSales = await Sale.countDocuments({ ...dateFilter, paymentStatus: 'paid' });
    const pendingSales = await Sale.countDocuments({ ...dateFilter, paymentStatus: 'pending' });

    const salesByPaymentMethod = await Sale.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$total' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalSales,
        totalRevenue: totalRevenue[0]?.total || 0,
        paidSales,
        pendingSales,
        salesByPaymentMethod
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

module.exports = router;
