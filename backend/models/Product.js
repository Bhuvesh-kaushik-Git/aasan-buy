const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  categories: [{ type: String }],
  stock: { type: Number, default: 0 },
  sku: { type: String, default: '' },
  sold: { type: Number, default: 0 },
  mrp: { type: Number, default: 0 },
  brand: { type: String, default: '' },
  colors: [{ 
    name: { type: String },
    hex: { type: String },
    images: [{ type: String }]
  }],
  sizes: [{ type: String }],
  highlights: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
