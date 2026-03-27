const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح لك بالوصول إلى هذا المسار'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'الحساب غير مفعل'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح لك بالوصول إلى هذا المسار'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `دور ${req.user.role} غير مصرح له بالوصول إلى هذا المسار`
      });
    }
    next();
  };
};
