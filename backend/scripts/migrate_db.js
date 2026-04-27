require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

const Category = require('../models/Category');
const Product = require('../models/Product');

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const products = await mongoose.connection.collection('products').find({}).toArray();
    console.log(`Found ${products.length} products to migrate.`);

    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
      categoryMap[cat.name.toLowerCase()] = cat._id;
    });

    let migratedCount = 0;

    for (const product of products) {
      const updates = {};
      const newCategories = [];
      // Handle both 'categories' (plural) and 'category' (singular)
      const oldCategories = product.categories || (product.category ? [product.category] : []);
      for (const cat of oldCategories) {
        if (mongoose.Types.ObjectId.isValid(cat)) {
           newCategories.push(new mongoose.Types.ObjectId(cat));
        } else if (typeof cat === 'string') {
          const matchedId = categoryMap[cat] || categoryMap[cat.toLowerCase()];
          if (matchedId) {
            newCategories.push(matchedId);
          } else {
             console.warn(`Warning: Category "${cat}" not found for product "${product.name}". Creating it.`);
             const newCat = await Category.create({ name: cat, slug: cat.toLowerCase().replace(/\s+/g, '-') });
             categoryMap[cat] = newCat._id;
             categoryMap[cat.toLowerCase()] = newCat._id;
             newCategories.push(newCat._id);
          }
        } else {
           newCategories.push(cat);
        }
      }
      updates.categories = newCategories;

      // Migrate Variants (colors & sizes -> variants)
      if (!product.variants || product.variants.length === 0) {
        const variants = [];
        const oldColors = product.colors || [];
        const oldSizes = product.sizes || [];
        const baseSku = product.sku || product._id.toString().substring(0, 8);

        // If both colors and sizes exist, create permutations
        if (oldColors.length > 0 && oldSizes.length > 0) {
          oldColors.forEach((color, cIdx) => {
            oldSizes.forEach((size, sIdx) => {
              variants.push({
                sku: `${baseSku}-${color.name.substring(0,3).toUpperCase()}-${size.toUpperCase()}`,
                attributes: { color: color.name, size: size },
                stock: product.stock || 0, // Default distribute base stock
                priceOverride: product.price
              });
            });
          });
        } else if (oldColors.length > 0) {
          oldColors.forEach((color, cIdx) => {
            variants.push({
              sku: `${baseSku}-${color.name.substring(0,3).toUpperCase()}`,
              attributes: { color: color.name, size: '' },
              stock: product.stock || 0,
              priceOverride: product.price
            });
          });
        } else if (oldSizes.length > 0) {
          oldSizes.forEach((size, sIdx) => {
            variants.push({
              sku: `${baseSku}-${size.toUpperCase()}`,
              attributes: { color: '', size: size },
              stock: product.stock || 0,
              priceOverride: product.price
            });
          });
        } else {
           // Base variant if no colors or sizes
           variants.push({
              sku: baseSku,
              attributes: { color: '', size: '' },
              stock: product.stock || 0,
              priceOverride: product.price
           });
        }
        updates.variants = variants;
      }

      // Ensure status and other defaults are set
      updates.status = product.status || 'Active';
      updates.isFeatured = product.isFeatured ?? false;
      updates.metaTitle = product.metaTitle || '';
      updates.metaDescription = product.metaDescription || '';

      // We explicitly UNSET colors and sizes
      await mongoose.connection.collection('products').updateOne(
        { _id: product._id },
        { 
           $set: updates, 
           $unset: { colors: "", sizes: "" } 
        }
      );
      migratedCount++;
    }

    console.log(`Migration completed successfully! Migrated ${migratedCount} products.`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    mongoose.disconnect();
  }
}

migrate();
