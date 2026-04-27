const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// @desc    Get all products with pagination and search
// @route   GET /api/products
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
      .populate('categories', 'name slug')
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
// @route   POST /api/products
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
// @route   PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc    Bulk upload products from Excel JSON
// @route   POST /api/products/bulk
router.post('/bulk', async (req, res) => {
  try {
    const products = req.body.products;
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const bulkOps = [];
    let added = 0;
    let updated = 0;
    let errors = [];

    for (let i = 0; i < products.length; i++) {
       const p = products[i];
       if (!p.name || p.price === undefined || p.price === null || isNaN(Number(p.price))) {
           errors.push(`Row ${i+1}: Missing or invalid required fields (Name or Price)`);
           continue;
       }
       if (p.sku) {
          bulkOps.push({
             updateOne: {
                filter: { sku: p.sku },
                update: {
                   $set: {
                      name: p.name,
                      description: p.description,
                      price: Number(p.price),
                      categories: p.categories,
                      images: p.images,
                      mrp: Number(p.mrp) || 0,
                      brand: p.brand || '',
                      status: p.status || 'Active',
                      tags: p.tags || [],
                      taxRate: Number(p.taxRate) || 0,
                      costPrice: Number(p.costPrice) || 0,
                      weight: Number(p.weight) || 0,
                      dimensions: p.dimensions || { length: 0, width: 0, height: 0 },
                      variants: p.variants || []
                   },
                   $inc: { stock: Number(p.stock) || 0 }
                },
                upsert: true
             }
          });
       } else {
          bulkOps.push({
             insertOne: {
                document: p
             }
          });
       }
    }

    if (bulkOps.length > 0) {
       // ordered: false allows it to continue even if one document fails validation
       const result = await Product.bulkWrite(bulkOps, { ordered: false });
       added = (result.upsertedCount || 0) + (result.insertedCount || 0);
       updated = result.modifiedCount || 0;
    }

    res.status(201).json({ message: `Bulk import complete`, added, updated, errors });
  } catch (err) {
    console.error('Bulk Import Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// @desc    Bulk delete products
// @route   DELETE /api/products/bulk
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
