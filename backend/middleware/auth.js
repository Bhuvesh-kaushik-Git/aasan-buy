const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect customer routes – requires valid JWT
const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies first, then headers
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
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
