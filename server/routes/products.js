const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, search, isActive, sort } = req.query;
    
    // Build query
    let query = {};
    
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    let sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'price') sortOption = { price: 1 };
    if (sort === 'quantity') sortOption = { quantity: 1 };

    const products = await Product.find(query).sort(sortOption);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private
router.post('/', [
  protect,
  body('name').notEmpty().withMessage('اسم المنتج مطلوب'),
  body('sku').notEmpty().withMessage('رمز المنتج مطلوب'),
  body('category').notEmpty().withMessage('الفئة مطلوبة'),
  body('price').isNumeric().withMessage('السعر يجب أن يكون رقماً'),
  body('quantity').isNumeric().withMessage('الكمية يجب أن تكون رقماً')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    // Check if SKU exists
    const existingProduct = await Product.findOne({ sku: req.body.sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'رمز المنتج موجود بالفعل'
      });
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }

    // Check if SKU is being changed and if it exists
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: req.body.sku });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'رمز المنتج موجود بالفعل'
        });
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: product
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private
router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'تم حذف المنتج بنجاح'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   GET /api/products/low-stock
// @desc    Get low stock products
// @access  Private
router.get('/low-stock', protect, async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$quantity', '$minQuantity'] },
      isActive: true
    });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   PUT /api/products/:id/stock
// @desc    Update product stock
// @access  Private
router.put('/:id/stock', protect, async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    
    if (!quantity || !operation) {
      return res.status(400).json({
        success: false,
        message: 'الكمية ونوع العملية مطلوبان'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }

    if (operation === 'add') {
      product.quantity += quantity;
    } else if (operation === 'subtract') {
      if (product.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: 'الكمية المطلوبة غير متوفرة في المخزون'
        });
      }
      product.quantity -= quantity;
    } else {
      return res.status(400).json({
        success: false,
        message: 'نوع العملية غير صالح'
      });
    }

    await product.save();

    res.json({
      success: true,
      data: product
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
