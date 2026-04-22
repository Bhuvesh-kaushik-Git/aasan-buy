const mongoose = require('mongoose');

const giftWrapSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  image: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('GiftWrap', giftWrapSchema);
