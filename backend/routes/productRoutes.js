const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// @route  GET /api/products  – Paginated + Search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    const sort = req.query.sort || 'newest';

    const query = {};
    if (ids.length > 0) {
      query._id = { $in: ids };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { categories: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) {
      query.categories = { $regex: category, $options: 'i' };
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'trending') sortQuery = { sold: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query).skip(skip).limit(limit).sort(sortQuery);
    res.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/products/:id  – Single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ message: 'Product not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/products/:id/reviews  – only approved reviews shown publicly
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id, status: 'approved' })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  POST /api/products/:id/reviews  – submit review (goes to pending queue)
router.post('/:id/reviews', async (req, res) => {
  try {
    const { rating, title, comment, guestName } = req.body;
    if (!rating || !comment) return res.status(400).json({ error: 'Rating and comment required' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const review = await Review.create({
      product: req.params.id,
      user: req.user ? req.user._id : null,
      guestName: req.user ? undefined : (guestName || 'Anonymous'),
      rating,
      title,
      comment,
      status: 'pending', // Always pending – admin must approve
    });

    res.status(201).json({ success: true, message: 'Your review has been submitted and is awaiting approval.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route  POST /api/products/bulk-stock  – Efficiency: check stock for multiple items
router.post('/bulk-stock', async (req, res) => {
  try {
    const { itemIds } = req.body;
    if (!Array.isArray(itemIds)) return res.status(400).json({ error: 'Array of itemIds required' });
    const products = await Product.find({ _id: { $in: itemIds } }).select('stock');
    const stockMap = {};
    products.forEach(p => { stockMap[p._id] = p.stock; });
    res.json(stockMap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
