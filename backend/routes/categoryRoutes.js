const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// @desc    Get all categories for storefront
// @route   GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory')
      .sort({ displayOrder: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
