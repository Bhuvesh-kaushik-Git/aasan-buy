const express  = require('express');
const router   = express.Router();
const Order    = require('../models/Order');
const User     = require('../models/User');
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
// ── Helper: Deduct stock after confirmed payment ──────────────────────────────
const deductStock = async (items) => {
  const results = await Promise.all(
    items.map(async (item) => {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, sold: item.quantity } },
        { new: true }
      );
      return { productId: item.productId, success: !!updated };
    })
  );
  return results;
};

// ── Helper: Resolve logged-in user from optional bearer token ─────────────────
const resolveUserId = (req) => {
  try {
    const token = req.cookies.token;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

// ── Helper: Generate Referral Reward Coupon ──────────────────────────────
const generateReferralCoupon = async (referrerId) => {
  const code = `REF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  await Coupon.create({
    code,
    discountType: 'fixed',
    discountValue: 100, // Reward of 100 INR
    isActive: true,
    type: 'referral',
    assignedTo: referrerId,
    maxUses: 1,
    description: 'Referral Reward for sharing AasanBuy'
  });
  return code;
};

// @route POST /api/orders  – Create order
router.post('/', async (req, res) => {
  try {
    const { customerDetails, items, totalAmount, paymentMethod, couponCode, referralCode, currency = 'INR' } = req.body;

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

    const userIdFromToken = resolveUserId(req);
    let userId = userIdFromToken;

    // ── Guest to Account Linking & Referral Tracking ─────────────────
    let userRecord = null;
    if (userId) {
      userRecord = await User.findById(userId);
    } else {
      userRecord = await User.findOne({ email: customerDetails.email.toLowerCase() });
      if (!userRecord) {
        userRecord = await User.create({
          name: customerDetails.fullName,
          email: customerDetails.email.toLowerCase(),
          phone: customerDetails.phone,
          password: crypto.randomBytes(16).toString('hex'),
          isGuest: true
        });
      }
      userId = userRecord._id;
    }

    // Link referral if provided and not already linked
    if (referralCode && !userRecord.referredBy) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer && referrer._id.toString() !== userId.toString()) {
        userRecord.referredBy = referrer._id;
        await userRecord.save();
      }
    }

    // ── Coupon Validation ─────────────────────────────────────────
    let discountAmount = 0;
    let appliedCoupon  = null;
    if (couponCode) {
      appliedCoupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (appliedCoupon) {
        const expired  = appliedCoupon.expiresAt && new Date() > appliedCoupon.expiresAt;
        const maxedOut = appliedCoupon.maxUses !== null && appliedCoupon.usedCount >= appliedCoupon.maxUses;
        
        // Custom Assignment/New User Logic
        const isAssigned = appliedCoupon.assignedTo && appliedCoupon.assignedTo.length > 0;
        const isWrongUser = isAssigned && !appliedCoupon.assignedTo.some(id => id.toString() === userId.toString());
        
        let isNotNewUser = false;
        if (appliedCoupon.isNewUserOnly) {
          const hasPaidOrder = await Order.exists({ user: userId, paymentStatus: 'paid' });
          if (hasPaidOrder) isNotNewUser = true;
        }

        if (expired || maxedOut || isWrongUser || isNotNewUser) {
          appliedCoupon = null;
        } else {
          discountAmount =
            appliedCoupon.discountType === 'percentage'
              ? Math.round((appliedCoupon.discountValue / 100) * totalAmount)
              : appliedCoupon.discountValue;
        }
      }
    }

    const finalAmountBeforeCoins = Math.max(0, totalAmount - discountAmount);
    
    // ── AasanCoins Usage ──────────────────────────────────────────
    let coinsUsed = 0;
    if (req.body.useAasanCoins && userRecord) {
      coinsUsed = Math.min(userRecord.aasanCoins || 0, finalAmountBeforeCoins);
    }
    const finalAmount = finalAmountBeforeCoins - coinsUsed;

    // ── Create Order ──────────────────────────────────────────────
    const newOrder = new Order({
      customerDetails,
      items,
      totalAmount: finalAmount,
      originalAmount: totalAmount,
      discountAmount: discountAmount + coinsUsed,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      paymentMethod,
      currency,
      user: userId,
      referralAttributed: !!userRecord.referredBy,
      aasanCoinsUsed: coinsUsed,
      aasanCoinsEarned: Math.floor(finalAmount * 0.01) // 1% earn rate
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
      return res.status(201).json({
        success: true,
        order: newOrder,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOptions.amount,
      });
    } else {
      // COD – deduct stock immediately
      const stockResults = await deductStock(items);
      if (stockResults.some(r => !r.success)) {
        return res.status(400).json({ error: 'Some items just went out of stock. Please refresh your cart.' });
      }

      newOrder.paymentStatus = 'pending';
      await newOrder.save();
      
      if (appliedCoupon)
        await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });

      // Update User Coins
      if (userRecord && coinsUsed > 0) {
        await User.findByIdAndUpdate(userId, { $inc: { aasanCoins: -coinsUsed } });
      }

      // Referral Reward Logic
      if (userRecord && userRecord.referredBy) {
        await generateReferralCoupon(userRecord.referredBy);
      }

      sendOrderConfirmation(newOrder).catch(() => {});
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
    const stockResults = await deductStock(order.items);
    if (stockResults.some(r => !r.success)) {
       // CRITICAL: Stock failed AFTER payment. 
       // We mark the order but admin needs to handle it (Refund or manual fix).
       order.orderStatus = 'Alert: Stock Issue';
       await order.save();
       return res.status(200).json({ success: true, message: 'Payment verified but some items are out of stock. Support will contact you.', stockIssue: true });
    }

    // Increment coupon usage
    if (order.couponCode)
      await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });

    // Update User Coins (Earned + Deduct Used)
    if (order.user) {
       await User.findByIdAndUpdate(order.user, { 
          $inc: { aasanCoins: order.aasanCoinsEarned - order.aasanCoinsUsed } 
       });
    }

    // Referral Reward Logic
    if (order.referralAttributed && order.user) {
      const userRecord = await User.findById(order.user);
      if (userRecord && userRecord.referredBy) {
        await generateReferralCoupon(userRecord.referredBy);
      }
    }

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

// @route POST /api/orders/track
// @desc  Track order status without login (Guest Tracking)
router.post('/track', async (req, res) => {
  try {
    const { email, orderId } = req.body;
    if (!email || !orderId) return res.status(400).json({ error: 'Email and Order ID are required' });

    // Validate if it's a valid ObjectId first to avoid cast errors
    if (!crypto.createHash('sha1').update(orderId).digest('hex').match(/^[0-9a-fA-F]{24}$/) && orderId.length !== 24) {
        // Fallback for non-objectid searches if needed, but here we expect mongo ids
    }

    const order = await Order.findOne({ _id: orderId, 'customerDetails.email': email.toLowerCase() })
      .select('orderStatus tracking customerDetails totalAmount createdAt items paymentStatus');
    
    if (!order) return res.status(404).json({ error: 'Order not found with these details' });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Tracking system error' });
  }
});

module.exports = router;
