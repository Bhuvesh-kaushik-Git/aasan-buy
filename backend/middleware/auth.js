const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect customer routes – requires valid JWT
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ error: 'User not found' });
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Not authorized, token invalid' });
    }
  } else {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

// Protect admin-only routes
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Admins only' });
  }
};

module.exports = { protect, adminOnly };
