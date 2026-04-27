const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// @desc    Get all categories
// @route   GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parentCategory')
      .sort({ displayOrder: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Create a category
// @route   POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, image, slug, description, isActive, parentCategory, displayOrder, metaTitle, metaDescription } = req.body;
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Category name already exists' });

    const cat = await Category.create({ 
      name, image, slug, description, isActive: isActive ?? true,
      parentCategory: parentCategory || null,
      displayOrder: displayOrder || 0,
      metaTitle, metaDescription
    });
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

    cat.name = req.body.name || cat.name;
    cat.image = req.body.image !== undefined ? req.body.image : cat.image;
    cat.slug = req.body.slug !== undefined ? req.body.slug : cat.slug;
    cat.description = req.body.description !== undefined ? req.body.description : cat.description;
    cat.isActive = req.body.isActive !== undefined ? req.body.isActive : cat.isActive;
    cat.parentCategory = req.body.parentCategory !== undefined ? req.body.parentCategory : cat.parentCategory;
    cat.displayOrder = req.body.displayOrder !== undefined ? req.body.displayOrder : cat.displayOrder;
    cat.metaTitle = req.body.metaTitle !== undefined ? req.body.metaTitle : cat.metaTitle;
    cat.metaDescription = req.body.metaDescription !== undefined ? req.body.metaDescription : cat.metaDescription;

    await cat.save();

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

    await cat.deleteOne();

    // Remove this category from all products
    await Product.updateMany(
      { categories: cat._id },
      { $pull: { categories: cat._id } }
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

    // Step 1: Strip this category from all products inside the DB
    await Product.updateMany(
       { categories: cat._id },
       { $pull: { categories: cat._id } }
    );

    // Step 2: Add this category to the explicitly specified products
    if (productIds.length > 0) {
       await Product.updateMany(
          { _id: { $in: productIds } },
          { $addToSet: { categories: cat._id } }
       );
    }

    res.json({ message: 'Products successfully bound to category' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Bulk upload categories
// @route   POST /api/categories/bulk
router.post('/bulk', async (req, res) => {
  try {
    const { categories } = req.body;
    if (!Array.isArray(categories)) return res.status(400).json({ message: 'Invalid payload' });

    const results = { added: 0, updated: 0, errors: [] };
    
    // Helper to escape regex special characters
    const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    for (let i = 0; i < categories.length; i++) {
      try {
        const c = categories[i];
        if (!c.name) {
          results.errors.push(`Row ${i+1}: Name is required`);
          continue;
        }

        const slug = c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        
        const updateData = {
          name: c.name,
          slug,
          image: c.image || '',
          description: c.description || '',
          isActive: c.isActive !== undefined ? c.isActive : true,
          displayOrder: Number(c.displayOrder) || 0,
          metaTitle: c.metaTitle || '',
          metaDescription: c.metaDescription || ''
        };

        // Handle parent category by name if provided
        if (c.parentName) {
          const parent = await Category.findOne({ name: { $regex: new RegExp(`^${escapeRegex(c.parentName)}$`, 'i') } });
          if (parent) updateData.parentCategory = parent._id;
        }

        const result = await Category.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${escapeRegex(c.name)}$`, 'i') } },
          { $set: updateData },
          { upsert: true, new: true, includeResultMetadata: true }
        );

        if (result.lastErrorObject && result.lastErrorObject.updatedExisting) {
          results.updated++;
        } else {
          results.added++;
        }
      } catch (rowErr) {
        console.error(`Error processing row ${i+1}:`, rowErr);
        results.errors.push(`Row ${i+1}: ${rowErr.message}`);
      }
    }

    res.json(results);
  } catch (err) {
    console.error('Bulk Category Error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
