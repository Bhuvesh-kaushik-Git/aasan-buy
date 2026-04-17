const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route POST /api/orders  – Create order with inventory check
router.post('/', async (req, res) => {
  try {
    const { customerDetails, items, totalAmount, paymentMethod, couponCode, currency = 'INR' } = req.body;

    // ── INVENTORY CHECK ──────────────────────────────────────────
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ error: `Product "${item.name}" not found` });
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `"${item.name}" has only ${product.stock} unit(s) left. Please update your cart.`,
          outOfStock: true,
          productId: item.productId,
          availableStock: product.stock,
        });
      }
    }

    // ── COUPON VALIDATION ────────────────────────────────────────
    let discountAmount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      appliedCoupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (appliedCoupon) {
        if (appliedCoupon.discountType === 'percentage') {
          discountAmount = Math.round((appliedCoupon.discountValue / 100) * totalAmount);
        } else {
          discountAmount = appliedCoupon.discountValue;
        }
      }
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // ── CREATE ORDER ─────────────────────────────────────────────
    const newOrder = new Order({
      customerDetails,
      items,
      totalAmount: finalAmount,
      originalAmount: totalAmount,
      discountAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      paymentMethod,
      currency,
    });

    if (paymentMethod === 'razorpay') {
      const rzpOptions = {
        amount: Math.round(finalAmount * 100),
        currency: currency,
        receipt: `receipt_${Date.now()}`,
      };
      const rzpOrder = await razorpay.orders.create(rzpOptions);
      newOrder.razorpayOrderId = rzpOrder.id;
      await newOrder.save();

      // Deduct stock AFTER successful Razorpay order creation
      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity, sold: item.quantity },
        });
      }
      // Increment coupon usage
      if (appliedCoupon) await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });

      return res.status(201).json({ success: true, order: newOrder, razorpayOrderId: rzpOrder.id, amount: rzpOptions.amount });
    } else {
      // COD – deduct stock immediately
      newOrder.paymentStatus = 'pending';
      await newOrder.save();

      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity, sold: item.quantity },
        });
      }
      if (appliedCoupon) await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });

      return res.status(201).json({ success: true, order: newOrder });
    }
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Server error creating order.' });
  }
});

// @route POST /api/orders/verify-payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      const order = await Order.findById(order_id);
      if (order) {
        order.paymentStatus = 'paid';
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();
      }
      return res.status(200).json({ success: true, message: 'Payment verified' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error verifying payment.' });
  }
});

module.exports = router;
