const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, required: true },
  price:       { 
    type: Number, 
    required: true,
    validate: [
      function(val) { return !this.mrp || val <= this.mrp; },
      'Price cannot be greater than MRP'
    ]
  },
  images:      [{ type: String }],
  categories:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  stock:       { type: Number, default: 0, min: [0, 'Stock cannot be negative'] },
  sku:         { type: String, default: '' },
  sold:        { type: Number, default: 0 },
  mrp:         { type: Number, default: 0 },
  brand:       { type: String, default: '' },
  status:      { type: String, enum: ['Draft', 'Active', 'Archived'], default: 'Active' },
  tags:        [{ type: String }],
  taxRate:     { type: Number, default: 0 },
  costPrice:   { type: Number, default: 0 },
  weight:      { type: Number, default: 0 },
  dimensions:  {
    length: { type: Number, default: 0 },
    width:  { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },
  variants: [{
    sku: { type: String },
    attributes: {
      color: { type: String, default: '' },
      size: { type: String, default: '' }
    },
    stock: { type: Number, default: 0, min: [0, 'Variant stock cannot be negative'] },
    priceOverride: { type: Number }
  }],
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false },
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
productSchema.index({ "variants.sku": 1 }, { unique: true, sparse: true }); // Unique variant SKU

module.exports = mongoose.model('Product', productSchema);
