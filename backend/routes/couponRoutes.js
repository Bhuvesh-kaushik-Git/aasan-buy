const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// @route POST /api/coupons/validate – validate coupon at checkout
router.post('/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });
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
