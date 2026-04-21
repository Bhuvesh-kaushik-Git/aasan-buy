const express  = require('express');
const router   = express.Router();
const Order    = require('../models/Order');
const Product  = require('../models/Product');
const Coupon   = require('../models/Coupon');
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const jwt      = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const { sendOrderConfirmation } = require('../utils/email');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Helper: Deduct stock after confirmed payment ──────────────────────────────
const deductStock = async (items) => {
  await Promise.all(
    items.map((item) =>
      Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      })
    )
  );
};

// ── Helper: Resolve logged-in user from optional bearer token ─────────────────
const resolveUserId = (req) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return null;
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

// @route POST /api/orders  – Create order
router.post('/', async (req, res) => {
  try {
    const { customerDetails, items, totalAmount, paymentMethod, couponCode, currency = 'INR' } = req.body;

    // ── Inventory Check ───────────────────────────────────────────
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product)
        return res.status(404).json({ error: `Product "${item.name}" not found` });
      if (product.stock < item.quantity)
        return res.status(400).json({
          error: `"${item.name}" has only ${product.stock} unit(s) left.`,
          outOfStock: true,
          productId: item.productId,
          availableStock: product.stock,
        });
    }

    // ── Coupon Validation ─────────────────────────────────────────
    let discountAmount = 0;
    let appliedCoupon  = null;
    if (couponCode) {
      appliedCoupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (appliedCoupon) {
        const expired  = appliedCoupon.expiresAt && new Date() > appliedCoupon.expiresAt;
        const maxedOut = appliedCoupon.maxUses !== null && appliedCoupon.usedCount >= appliedCoupon.maxUses;
        if (expired || maxedOut) {
          appliedCoupon = null;
        } else {
          discountAmount =
            appliedCoupon.discountType === 'percentage'
              ? Math.round((appliedCoupon.discountValue / 100) * totalAmount)
              : appliedCoupon.discountValue;
        }
      }
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);
    const userId      = resolveUserId(req);

    // ── Create Order ──────────────────────────────────────────────
    const newOrder = new Order({
      customerDetails,
      items,
      totalAmount: finalAmount,
      originalAmount: totalAmount,
      discountAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      paymentMethod,
      currency,
      user: userId,
    });

    if (paymentMethod === 'razorpay') {
      const rzpOptions = {
        amount:  Math.round(finalAmount * 100),
        currency,
        receipt: `rcpt_${Date.now()}`,
      };
      const rzpOrder = await razorpay.orders.create(rzpOptions);
      newOrder.razorpayOrderId = rzpOrder.id;
      await newOrder.save();
      // ⚠️ Stock NOT deducted here — only after payment is verified
      return res.status(201).json({
        success: true,
        order: newOrder,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOptions.amount,
      });
    } else {
      // COD – deduct stock immediately as payment is on delivery
      newOrder.paymentStatus = 'pending';
      await newOrder.save();
      await deductStock(items);
      if (appliedCoupon)
        await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });
      sendOrderConfirmation(newOrder).catch(() => {}); // Non-blocking
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

    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (razorpay_signature !== expectedSign)
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });

    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Idempotent – skip if already processed
    if (order.paymentStatus === 'paid')
      return res.status(200).json({ success: true, message: 'Payment already verified' });

    order.paymentStatus    = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // ✅ Deduct stock ONLY after payment confirmed
    await deductStock(order.items);

    // Increment coupon usage
    if (order.couponCode)
      await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });

    sendOrderConfirmation(order).catch(() => {}); // Non-blocking
    return res.status(200).json({ success: true, message: 'Payment verified' });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Server error verifying payment.' });
  }
});

// @route GET /api/orders/my-orders  – Authenticated user's own orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-razorpayPaymentId -razorpayOrderId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching orders.' });
  }
});

// @route GET /api/orders/:id – Get order details by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching order.' });
  }
});

module.exports = router;
