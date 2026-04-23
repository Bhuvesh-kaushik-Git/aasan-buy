const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// @desc    Get all users with pagination and search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { role: 'customer' }; // Usually we only manage customers here
    if (req.query.search) {
      const q = req.query.search;
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const [usersRaw, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);

    const users = await Promise.all(usersRaw.map(async (u) => {
       const stats = await Order.aggregate([
          { $match: { user: u._id, paymentStatus: 'paid' } },
          { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
       ]);
       return {
          ...u.toObject(),
          orderCount: stats[0]?.count || 0,
          totalSpent: stats[0]?.total || 0
       };
    }));

    res.json({
      users,
      page,
      pages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Toggle user active status
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.isActive = !user.isActive;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @desc    Update user coins
router.put('/:id/update-coins', async (req, res) => {
  try {
    const { coins } = req.body;
    if (typeof coins !== 'number' || coins < 0) {
      return res.status(400).json({ error: 'Invalid coins value. Must be a non-negative number.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.aasanCoins = coins;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @desc    Get orders for a specific user
router.get('/:id/orders', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Delete user

module.exports = router;
