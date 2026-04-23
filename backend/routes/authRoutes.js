const express    = require('express');
const router     = express.Router();
const jwt        = require('jsonwebtoken');
const rateLimit  = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User       = require('../models/User');
const Order      = require('../models/Order');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const sendTokenResponse = (user, statusCode, res, message = null) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Needed for cross-domain cookies in development
  };

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      referralCode: user.referralCode,
      aasanCoins: user.aasanCoins,
      coins: user.aasanCoins,
      success: true,
      message
    });
};

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
      sendTokenResponse(user, 201, res);
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
      sendTokenResponse(user, 200, res);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// @route  GET /api/auth/profile  (protected)
router.get('/profile', protect, async (req, res) => {
  const user = req.user;
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    referralCode: user.referralCode,
    aasanCoins: user.aasanCoins,
    coins: user.aasanCoins,
    addresses: user.addresses,
    wishlist: user.wishlist,
    cart: user.cart,
    success: true
  });
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
      res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, referralCode: user.referralCode, aasanCoins: user.aasanCoins, coins: user.aasanCoins });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// @route  POST /api/auth/claim-account
// @desc   Set password for a ghost user (one who ordered as guest)
router.post(
  '/claim-account',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(404).json({ error: 'No account found with this email' });
      if (!user.isGuest) return res.status(400).json({ error: 'This account is already registered. Please login.' });

      user.password = password;
      user.isGuest = false;
      await user.save();

      sendTokenResponse(user, 200, res, 'Account claimed successfully! You can now login.');
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// @route  GET /api/auth/referrals
// @desc   Get list of referred users and their order status
router.get('/referrals', protect, async (req, res) => {
  try {
    const referredUsers = await User.find({ referredBy: req.user._id }).select('name createdAt');
    
    const detailedReferrals = await Promise.all(referredUsers.map(async (u) => {
      const hasOrdered = await Order.exists({ user: u._id, paymentStatus: { $in: ['paid', 'pending'] } }); // pending counts for COD
      return {
        name: u.name,
        dateJoined: u.createdAt,
        hasPlacedOrder: !!hasOrdered
      };
    }));
    
    res.json(detailedReferrals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route  POST /api/auth/addresses
// @desc   Add new address
router.post('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const newAddress = { ...req.body, isDefault: req.body.isDefault || false };
    if (newAddress.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }
    user.addresses.push(newAddress);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route  DELETE /api/auth/addresses/:id
// @desc   Remove an address
router.delete('/addresses/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route  GET /api/auth/cart
// @desc   Get user persistent cart
router.get('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('cart');
    res.json(user.cart || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route  PUT /api/auth/cart
// @desc   Update user persistent cart
router.put('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = req.body.cart; // Expecting array of cart items
    await user.save();
    res.json({ success: true, cart: user.cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out' });
});

// @route  GET /api/auth/verify-referral/:code
// @desc   Check if a referral code is valid and return the owner's name
router.get('/verify-referral/:code', async (req, res) => {
  try {
    const user = await User.findOne({ referralCode: req.params.code.toUpperCase() }).select('name');
    if (!user) return res.status(404).json({ valid: false, error: 'Invalid referral code' });
    res.json({ valid: true, name: user.name });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;
