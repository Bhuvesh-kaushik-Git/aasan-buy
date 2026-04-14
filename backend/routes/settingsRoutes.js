const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');

// @desc    Get site settings
// @route   GET /api/settings
router.get('/', async (req, res) => {
  try {
    const settings = await SiteSettings.findOne({});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
