const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
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
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating status' });
  }
});

// Update payment status
router.put('/:id/payment', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating payment status' });
  }
});

// @route PUT /api/orders/:id/details
// @desc  Update customer shipping/contact details
router.put('/:id/details', async (req, res) => {
  try {
    const { customerDetails } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.customerDetails = { ...order.customerDetails, ...customerDetails };
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating details' });
  }
});

// @route POST /api/orders/:id/items
// @desc  Add new item to existing order (deducts stock)
router.post('/:id/items', async (req, res) => {
  try {
    const { productId, quantity, selectedColor, selectedSize } = req.body;
    
    // 1. Check & Deduct Stock Atomically
    const product = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity, sold: quantity } },
      { new: true }
    );

    if (!product) return res.status(400).json({ error: 'Insufficient stock or product not found' });

    // 2. Add to order
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const newItem = {
      productId,
      name: product.name,
      price: product.price,
      quantity,
      selectedColor,
      selectedSize,
      image: selectedColor?.images?.[0] || product.images?.[0]
    };

    order.items.push(newItem);
    order.totalAmount += (product.price * quantity);
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error adding item' });
  }
});

// @route POST /api/orders/:id/rollback
// @desc  Cancel order and return all items to stock
router.post('/:id/rollback', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.orderStatus === 'Cancelled') return res.status(400).json({ error: 'Order already cancelled' });

    // Return stock
    await Promise.all(order.items.map(item => 
      Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity, sold: -item.quantity } })
    ));

    order.orderStatus = 'Cancelled';
    await order.save();

    res.json({ success: true, message: 'Stock rolled back and order cancelled', order });
  } catch (error) {
    res.status(500).json({ error: 'Server error performing rollback' });
  }
});

module.exports = router;
