const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// @route POST /api/coupons/validate – validate coupon at checkout
router.post('/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });

    // Handle NEWUSER10 restrictions
    if (code.toUpperCase() === 'NEWUSER10') {
      let userId;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer')) {
        try {
          const token = authHeader.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.id;
        } catch (err) {
          return res.status(401).json({ error: 'Please login to use this welcome coupon' });
        }
      }

      if (!userId) {
        return res.status(401).json({ error: 'This coupon is valid only for registered users' });
      }

      // Check if user has already used this coupon in a previous order
      const existingOrder = await Order.findOne({ user: userId, couponCode: 'NEWUSER10' });
      if (existingOrder) {
        return res.status(400).json({ error: 'You have already used your welcome coupon' });
      }
    }

    if (!coupon.isActive) return res.status(400).json({ error: 'This coupon is no longer active' });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return res.status(400).json({ error: 'This coupon has expired' });
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'This coupon has reached its usage limit' });
    if (orderTotal < coupon.minOrderValue) return res.status(400).json({ error: `Minimum order value of ₹${coupon.minOrderValue} required` });

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((coupon.discountValue / 100) * orderTotal);
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({ valid: true, couponId: coupon._id, discountAmount, discountType: coupon.discountType, discountValue: coupon.discountValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
