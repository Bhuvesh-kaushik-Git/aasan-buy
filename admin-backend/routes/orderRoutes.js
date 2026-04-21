const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// Get all orders with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status && req.query.status !== 'All') {
      query.orderStatus = req.query.status;
    }
    if (req.query.search) {
      const q = req.query.search;
      query.$or = [
        { 'customerDetails.fullName': { $regex: q, $options: 'i' } },
        { 'customerDetails.email': { $regex: q, $options: 'i' } },
        { _id: q.length === 24 ? q : { $exists: true } } // Exact ID if valid length
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query)
    ]);

    res.json({
      orders,
      page,
      pages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (error) {
    console.error("Fetch orders Error", error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error("Update order Error", error);
    res.status(500).json({ error: 'Server error updating order' });
  }
});

module.exports = router;
