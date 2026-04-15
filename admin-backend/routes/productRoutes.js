const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @desc    Get all products with pagination and search
// @route   GET /api/admin/products
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const search = req.query.search || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Add single product
// @route   POST /api/admin/products
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc    Update single product
// @route   PUT /api/admin/products/:id
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc    Bulk upload products from Excel JSON
// @route   POST /api/admin/products/bulk
router.post('/bulk', async (req, res) => {
  try {
    const products = req.body.products;
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    let added = 0;
    let updated = 0;

    for (let p of products) {
      if (p.sku) {
        // Look by exact SKU match
        const existing = await Product.findOne({ sku: p.sku });
        if (existing) {
          // Update count instead of erroring, maintaining sold state
          existing.stock = existing.stock + (Number(p.stock) || 0);
          // Optional: also update price/name if requested, but instruction specifically said "match with existing sku and update the count of the product"
          await existing.save();
          updated++;
        } else {
          // New product
          await Product.create(p);
          added++;
        }
      } else {
         // Create randomly if no SKU 
         await Product.create(p);
         added++;
      }
    }

    res.status(201).json({ message: `Bulk import complete`, added, updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Bulk delete products
// @route   DELETE /api/admin/products/bulk
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Invalid payload' });

    await Product.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Products deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
