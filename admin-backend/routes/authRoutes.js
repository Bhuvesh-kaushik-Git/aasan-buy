const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @route POST /api/auth/admin-login  – Admins only
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials or not an admin account' });
    }
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
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

module.exports = router;
