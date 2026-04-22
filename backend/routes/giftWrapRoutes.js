const express = require('express');
const router = express.Router();
const GiftWrap = require('../models/GiftWrap');

// @route GET /api/giftwraps
// @desc  Get only active gift wraps for customers
router.get('/', async (req, res) => {
  try {
    const wraps = await GiftWrap.find({ isActive: true }).select('title price image');
    res.json(wraps);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching gift wraps' });
  }
});

module.exports = router;
