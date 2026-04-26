const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');
const Product = require('../models/Product'); // Critical for population registry

// @desc    Get site settings
// @route   GET /api/settings
router.get('/', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({})
      .populate('homeProductTabs.products.product')
      .populate({
        path: 'occasionSections',
        populate: {
          path: 'occasions.products',
          model: 'Product'
        }
      });
    
    if (!settings) {
      // Create a minimal default if it doesn't exist
      settings = await SiteSettings.create({
        heroBanners: [{
          title: "Welcome to AasanBuy",
          subtitle: "Excellence Curated. Hand-picked essentials for your home.",
          imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48",
          linkUrl: "/products"
        }]
      });
    }

    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
