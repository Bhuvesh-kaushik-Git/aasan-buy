const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const User = require('../models/User');

// @route POST /api/coupons/validate – validate coupon at checkout
router.post('/validate', async (req, res) => {
  try {
    const { code, orderTotal, userId, email } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });
    if (!coupon.isActive) return res.status(400).json({ error: 'This coupon is no longer active' });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return res.status(400).json({ error: 'This coupon has expired' });
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'This coupon has reached its usage limit' });
    if (orderTotal < coupon.minOrderValue) return res.status(400).json({ error: `Minimum order value of ₹${coupon.minOrderValue} required` });

    // ── New User Check ──
    if (coupon.isNewUserOnly) {
      let alreadyOrdered = false;
      if (userId) {
        alreadyOrdered = await Order.exists({ user: userId, paymentStatus: 'paid' });
      } else if (email) {
        alreadyOrdered = await Order.exists({ 'customerDetails.email': email.toLowerCase(), paymentStatus: 'paid' });
      }
      if (alreadyOrdered) return res.status(400).json({ error: 'This coupon is only valid for your first order.' });
    }

    // ── Targeted User Check ──
    if (coupon.assignedTo && coupon.assignedTo.length > 0) {
      if (!userId) return res.status(400).json({ error: 'Please login to use this exclusive coupon.' });
      const isAssigned = coupon.assignedTo.some(id => id.toString() === userId.toString());
      if (!isAssigned) return res.status(400).json({ error: 'This coupon is not valid for your account.' });
    }

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
