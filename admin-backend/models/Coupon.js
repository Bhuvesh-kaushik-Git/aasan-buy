const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxUses: { type: Number, default: null }, // null = unlimited
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null }, // null = never expires
  isActive: { type: Boolean, default: true },
  isNewUserOnly: { type: Boolean, default: false },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs or empty for all
  type: { type: String, enum: ['general', 'referral'], default: 'general' },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
