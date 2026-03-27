const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    // Get counts
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalCustomers = await Customer.countDocuments({ isActive: true });
    const totalSales = await Sale.countDocuments();

    // Get low stock products
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$minQuantity'] },
      isActive: true
    });

    // Get total revenue
    const totalRevenue = await Sale.aggregate([
      { $match: { paymentStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get pending payments
    const pendingPayments = await Sale.aggregate([
      { $match: { paymentStatus: 'pending' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = await Sale.countDocuments({
      saleDate: { $gte: today, $lt: tomorrow }
    });

    const todayRevenue = await Sale.aggregate([
      { $match: { saleDate: { $gte: today, $lt: tomorrow }, paymentStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get this month's sales
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthSales = await Sale.countDocuments({
      saleDate: { $gte: firstDayOfMonth }
    });

    const monthRevenue = await Sale.aggregate([
      { $match: { saleDate: { $gte: firstDayOfMonth }, paymentStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalCustomers,
        totalSales,
        lowStockProducts,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingPayments: pendingPayments[0]?.total || 0,
        todaySales,
        todayRevenue: todayRevenue[0]?.total || 0,
        monthSales,
        monthRevenue: monthRevenue[0]?.total || 0
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

// @route   GET /api/dashboard/recent-sales
// @desc    Get recent sales
// @access  Private
router.get('/recent-sales', protect, async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('customer', 'name')
      .sort({ saleDate: -1 })
      .limit(10);

    res.json({
      success: true,
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

// @route   GET /api/dashboard/top-products
// @desc    Get top selling products
// @access  Private
router.get('/top-products', protect, async (req, res) => {
  try {
    const topProducts = await Sale.aggregate([
      { $unwind: '$items' },
      { $group: {
        _id: '$items.product',
        productName: { $first: '$items.productName' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.total' }
      }},
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: topProducts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   GET /api/dashboard/top-customers
// @desc    Get top customers by purchase amount
// @access  Private
router.get('/top-customers', protect, async (req, res) => {
  try {
    const topCustomers = await Sale.aggregate([
      { $match: { paymentStatus: { $ne: 'cancelled' } } },
      { $group: {
        _id: '$customer',
        customerName: { $first: '$customerName' },
        totalPurchases: { $sum: '$total' },
        totalOrders: { $sum: 1 }
      }},
      { $sort: { totalPurchases: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: topCustomers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: err.message
    });
  }
});

// @route   GET /api/dashboard/sales-chart
// @desc    Get sales data for chart (last 7 days)
// @access  Private
router.get('/sales-chart', protect, async (req, res) => {
  try {
    const days = 7;
    const labels = [];
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const daySales = await Sale.aggregate([
        { $match: { saleDate: { $gte: date, $lt: nextDate }, paymentStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);

      const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      labels.push(dayNames[date.getDay()]);
      data.push(daySales[0]?.total || 0);
    }

    res.json({
      success: true,
      data: {
        labels,
        data
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

// @route   GET /api/dashboard/category-sales
// @desc    Get sales by category
// @access  Private
router.get('/category-sales', protect, async (req, res) => {
  try {
    const categorySales = await Sale.aggregate([
      { $unwind: '$items' },
      { $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo'
      }},
      { $unwind: '$productInfo' },
      { $group: {
        _id: '$productInfo.category',
        totalSales: { $sum: '$items.total' },
        totalQuantity: { $sum: '$items.quantity' }
      }},
      { $sort: { totalSales: -1 } }
    ]);

    res.json({
      success: true,
      data: categorySales
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
