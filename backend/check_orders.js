const mongoose = require('mongoose');
require('dotenv').config();

const OrderSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  paymentStatus: String,
  totalAmount: Number
});

const Order = mongoose.model('Order', OrderSchema);

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const allOrders = await Order.find();
    console.log(`Total orders found: ${allOrders.length}`);
    
    const statuses = {};
    allOrders.forEach(o => {
      statuses[o.paymentStatus] = (statuses[o.paymentStatus] || 0) + 1;
    });
    console.log('Statuses:', statuses);

    const userOrders = allOrders.filter(o => o.user);
    console.log(`Orders with user ID: ${userOrders.length}`);
    if (userOrders.length > 0) {
      console.log('Sample User ID from Order:', userOrders[0].user);
      console.log('Type of User ID:', typeof userOrders[0].user);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkOrders();
