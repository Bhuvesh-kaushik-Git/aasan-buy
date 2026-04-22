const express = require('express');
const router = express.Router();
const GiftWrap = require('../models/GiftWrap');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// @route GET /api/giftwraps
router.get('/', async (req, res) => {
  try {
    const wraps = await GiftWrap.find().sort({ createdAt: -1 });
    res.json(wraps);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching gift wraps' });
  }
});

// @route POST /api/giftwraps
router.post('/', async (req, res) => {
  try {
    const { title, price, image, isActive } = req.body;
    const wrap = await GiftWrap.create({ title, price, image, isActive });
    res.status(201).json(wrap);
  } catch (error) {
    res.status(500).json({ error: 'Server error creating gift wrap' });
  }
});

// @route PUT /api/giftwraps/:id
router.put('/:id', async (req, res) => {
  try {
    const wrap = await GiftWrap.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!wrap) return res.status(404).json({ error: 'Gift wrap not found' });
    res.json(wrap);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating gift wrap' });
  }
});

// @route DELETE /api/giftwraps/:id
router.delete('/:id', async (req, res) => {
  try {
    const wrap = await GiftWrap.findByIdAndDelete(req.params.id);
    if (!wrap) return res.status(404).json({ error: 'Gift wrap not found' });
    res.json({ success: true, message: 'Gift wrap deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting gift wrap' });
  }
});

module.exports = router;
