const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Create a category
// @route   POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, image } = req.body;
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Category name already exists' });

    const cat = await Category.create({ name, image });
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });

    // If name changed, we should probably update all products that used the old name.
    const oldName = cat.name;
    const newName = req.body.name;

    cat.name = newName || cat.name;
    cat.image = req.body.image !== undefined ? req.body.image : cat.image;

    await cat.save();

    if (newName && oldName !== newName) {
      await Product.updateMany(
        { categories: oldName },
        { $set: { "categories.$": newName } }
      );
    }

    res.json(cat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });

    const name = cat.name;
    await cat.deleteOne();

    // Remove this category from all products
    await Product.updateMany(
      { categories: name },
      { $pull: { categories: name } }
    );

    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Assign/Remove products from a category
// @route   POST /api/categories/:id/products
// Body: { productIds: ['id1', 'id2'] }
router.post('/:id/products', async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });

    const { productIds } = req.body;
    if (!Array.isArray(productIds)) return res.status(400).json({ message: 'productIds must be an array' });

    const name = cat.name;

    // Step 1: Strip this category from all products inside the DB
    await Product.updateMany(
       { categories: name },
       { $pull: { categories: name } }
    );

    // Step 2: Add this category to the explicitly specified products
    if (productIds.length > 0) {
       await Product.updateMany(
          { _id: { $in: productIds } },
          { $addToSet: { categories: name } }
       );
    }

    res.json({ message: 'Products successfully bound to category' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
