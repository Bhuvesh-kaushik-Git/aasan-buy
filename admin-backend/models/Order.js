const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerDetails: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    selectedColor: { type: mongoose.Schema.Types.Mixed },
    selectedSize: { type: String },
    image: { type: String },
  }],
  totalAmount: { type: Number, required: true },
  originalAmount: { type: Number },
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String, enum: ['razorpay', 'cod'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing',
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional – null for guests
}, { timestamps: true });

// Indexes for high-speed admin lookups
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ 'customerDetails.email': 1 });
orderSchema.index({ 'customerDetails.fullName': 'text' });
orderSchema.index({ razorpayOrderId: 1 });
orderSchema.index({ user: 1 });

module.exports = mongoose.model('Order', orderSchema);
