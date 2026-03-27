const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/customers
// @desc    Get all customers
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, customerType, isActive, sort } = req.query;
    
    // Build query
    let query = {};
    
    if (customerType) query.customerType = customerType;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    let sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'balance') sortOption = { currentBalance: -1 };

    const customers = await Customer.find(query).sort(sortOption);

    res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   GET /api/customers/:id
// @desc    Get single customer
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   POST /api/customers
// @desc    Create new customer
// @access  Private
router.post('/', [
  protect,
  body('name').notEmpty().withMessage('اسم العميل مطلوب'),
  body('phone').notEmpty().withMessage('رقم الهاتف مطلوب')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    // Check if phone exists
    const existingCustomer = await Customer.findOne({ phone: req.body.phone });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف مسجل بالفعل'
      });
    }

    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }

    // Check if phone is being changed and if it exists
    if (req.body.phone && req.body.phone !== customer.phone) {
      const existingCustomer = await Customer.findOne({ phone: req.body.phone });
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'رقم الهاتف مسجل بالفعل'
        });
      }
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: customer
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   DELETE /api/customers/:id
// @desc    Delete customer
// @access  Private
router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }

    await customer.deleteOne();

    res.json({
      success: true,
      message: 'تم حذف العميل بنجاح'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   PUT /api/customers/:id/balance
// @desc    Update customer balance
// @access  Private
router.put('/:id/balance', protect, async (req, res) => {
  try {
    const { amount, operation } = req.body;
    
    if (!amount || !operation) {
      return res.status(400).json({
        success: false,
        message: 'المبلغ ونوع العملية مطلوبان'
      });
    }

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }

    if (operation === 'add') {
      customer.currentBalance += amount;
    } else if (operation === 'subtract') {
      customer.currentBalance -= amount;
    } else {
      return res.status(400).json({
        success: false,
        message: 'نوع العملية غير صالح'
      });
    }

    await customer.save();

    res.json({
      success: true,
      data: customer
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   GET /api/customers/stats/overview
// @desc    Get customer statistics
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ isActive: true });
    const companies = await Customer.countDocuments({ customerType: 'company' });
    const individuals = await Customer.countDocuments({ customerType: 'individual' });
    
    const totalBalance = await Customer.aggregate([
      { $group: { _id: null, total: { $sum: '$currentBalance' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        companies,
        individuals,
        totalBalance: totalBalance[0]?.total || 0
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
