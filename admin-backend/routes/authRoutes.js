const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      success: true
    });
};

// @route POST /api/auth/admin-login  – Admins only
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials or not an admin account' });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route POST /api/auth/create-admin  – Only use this ONCE to seed the first admin
// Protected: only usable if JWT_ADMIN_SEED_KEY matches
router.post('/create-admin', async (req, res) => {
  try {
    const { seedKey, name, email, password } = req.body;
    if (seedKey !== process.env.ADMIN_SEED_KEY) {
      return res.status(403).json({ error: 'Invalid seed key' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });
    const user = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ message: 'Admin created', email: user.email });
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

module.exports = router;
