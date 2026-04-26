const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  aasanCoins: Number
});

const User = mongoose.model('User', UserSchema);

async function checkCoins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ aasanCoins: { $gt: 0 } });
    console.log(`Found ${users.length} users with coins > 0:`);
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}): ${u.aasanCoins} coins`);
    });

    const allUsers = await User.countDocuments();
    const zeroCoins = await User.countDocuments({ $or: [{ aasanCoins: 0 }, { aasanCoins: { $exists: false } }] });
    console.log(`Total users: ${allUsers}`);
    console.log(`Users with 0 or missing coins: ${zeroCoins}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCoins();
