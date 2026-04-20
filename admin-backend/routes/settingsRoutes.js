const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');

// @desc    Get site settings
// @route   GET /api/settings
router.get('/', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({});
    if (!settings) {
      // Create default if not exists
      settings = await SiteSettings.create({
      heroBanners: [
        {
          title: "Make Every Moment Special",
          subtitle: "Order premium flowers, delicious cakes, and personalized gifts.",
          imageUrl: "https://images.unsplash.com/photo-1563241598-6bbdb1e96723",
          linkUrl: "#"
        }
      ]
      });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Update site settings
// @route   PUT /api/settings
router.put('/', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({});
    if (settings) {
      settings.heroBanners = req.body.heroBanners || settings.heroBanners;
      settings.logoUrl = req.body.logoUrl || settings.logoUrl;
      settings.footerText = req.body.footerText || settings.footerText;
      settings.navMenu = req.body.navMenu || settings.navMenu;
      settings.occasionSections = req.body.occasionSections !== undefined ? req.body.occasionSections : settings.occasionSections;
      settings.homeProductTabs = req.body.homeProductTabs !== undefined ? req.body.homeProductTabs : settings.homeProductTabs;
      
      // Force Mongoose to recognize changes in nested arrays
      settings.markModified('occasionSections');
      settings.markModified('homeProductTabs');
      settings.markModified('navMenu');
      settings.markModified('heroBanners');

      const updatedSettings = await settings.save();
      res.json(updatedSettings);
    } else {
      const newSettings = await SiteSettings.create(req.body);
      res.status(201).json(newSettings);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
