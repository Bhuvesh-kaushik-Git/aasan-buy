const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestName: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '' },
  comment: { type: String, required: true },
  isVerifiedPurchase: { type: Boolean, default: false },
  // ── Admin Moderation ────────────────────────────────────────
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending', // All reviews go to admin queue first
  },
  adminNote: { type: String, default: '' }, // Reason for rejection (optional)
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
