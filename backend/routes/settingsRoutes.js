const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');
const Product = require('../models/Product'); // Critical for population registry

// @desc    Get site settings
// @route   GET /api/settings
router.get('/', async (req, res) => {
  try {
    const settings = await SiteSettings.findOne({})
      .populate('homeProductTabs.products.product')
      .populate({
        path: 'occasionSections',
        populate: {
          path: 'occasions.products',
          model: 'Product'
        }
      });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
