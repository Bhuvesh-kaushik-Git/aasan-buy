const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true, sparse: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  displayOrder: { type: Number, default: 0 },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
