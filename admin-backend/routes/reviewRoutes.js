const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// @route GET /api/reviews  – get ALL reviews (with filter by status)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status } = req.query; // ?status=pending | approved | rejected
    const query = status ? { status } : {};

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('product', 'name images')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query)
    ]);

    res.json({
      reviews,
      page,
      pages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route PUT /api/reviews/:id/moderate  – approve or reject a review
router.put('/:id/moderate', async (req, res) => {
  try {
    const { status, adminNote } = req.body; // status: 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote || '' },
      { new: true }
    ).populate('product', 'name');

    if (!review) return res.status(404).json({ error: 'Review not found' });

    // If approved, recalculate product rating based on approved reviews only
    if (status === 'approved') {
      const approvedReviews = await Review.find({ product: review.product._id, status: 'approved' });
      const avgRating = approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length;
      await Product.findByIdAndUpdate(review.product._id, {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: approvedReviews.length,
      });
    }

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route DELETE /api/reviews/:id  – delete a review
router.delete('/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
