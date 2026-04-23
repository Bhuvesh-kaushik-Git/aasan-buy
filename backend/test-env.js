require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'MISSING');
console.log('PORT:', process.env.PORT);
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'MISSING');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'MISSING');
