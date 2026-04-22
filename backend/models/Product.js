const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  images:      [{ type: String }],
  categories:  [{ type: String }],
  stock:       { type: Number, default: 0 },
  sku:         { type: String, default: '' },
  sold:        { type: Number, default: 0 },
  mrp:         { type: Number, default: 0 },
  brand:       { type: String, default: '' },
  colors: [{
    name:   { type: String },
    hex:    { type: String },
    images: [{ type: String }],
  }],
  sizes:      [{ type: String }],
  highlights: [{ type: String }],
  rating:      { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  aiSuggestedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  customRecommendationRows: [
    {
      rowTitle: { type: String },
      type:     { type: String, enum: ['manual', 'ai', 'category', 'trending'], default: 'manual' },
      seedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      items:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
    }
  ]
}, { timestamps: true });

// ── Performance Indexes ────────────────────────────────────────────────────────
productSchema.index({ name: 'text', brand: 'text', description: 'text' }); // Full-text search
productSchema.index({ categories: 1 });      // Category filter
productSchema.index({ stock: 1 });           // Low-stock queries
productSchema.index({ sku: 1 });             // SKU lookup
productSchema.index({ price: 1 });           // Price sort/filter
productSchema.index({ createdAt: -1 });      // Default sort

module.exports = mongoose.model('Product', productSchema);
