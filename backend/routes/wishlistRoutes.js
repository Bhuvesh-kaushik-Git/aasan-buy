const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Get user wishlist
// @route   GET /api/wishlist
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Add/Remove product from wishlist (Toggle)
// @route   POST /api/wishlist/toggle
router.post('/toggle', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    
    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId);
      await user.save();
      res.json({ message: 'Added to wishlist', isWishlisted: true });
    } else {
      user.wishlist.splice(index, 1);
      await user.save();
      res.json({ message: 'Removed from wishlist', isWishlisted: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
