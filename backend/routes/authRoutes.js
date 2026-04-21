const express    = require('express');
const router     = express.Router();
const jwt        = require('jsonwebtoken');
const rateLimit  = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User       = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Rate limiter: max 10 attempts per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// @route  POST /api/auth/register
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().trim().isLength({ max: 20 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { name, email, password, phone } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ error: 'User already exists with this email' });
      const user = await User.create({ name, email, password, phone });
      res.status(201).json({
        _id: user._id, name: user.name, email: user.email,
        role: user.role, token: generateToken(user._id),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// @route  POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      if (user.isActive === false) {
        return res.status(403).json({ error: 'Your account has been disabled. Contact support.' });
      }
      res.json({
        _id: user._id, name: user.name, email: user.email,
        role: user.role, token: generateToken(user._id),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// @route  GET /api/auth/profile  (protected)
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

// @route  PUT /api/auth/profile  (protected) – Update name & phone
router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 100 }),
    body('phone').optional().trim().isLength({ max: 20 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (req.body.name  !== undefined) user.name  = req.body.name;
      if (req.body.phone !== undefined) user.phone = req.body.phone;
      await user.save();
      res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
