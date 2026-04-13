require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const SiteSettings = require('./models/SiteSettings'); // Assuming you want to seed this too

// Sample data with Unsplash images (FNP style)
const products = [
  {
    name: "Red Roses Elegance With Glass Vase",
    description: "12 Premium Red Roses, Elegant Glass Vase Included, Freshly plucked and properly sanitized, Wrapped elegantly with seasonal fillers",
    price: 249,
    images: [
      "https://images.unsplash.com/photo-1563241598-6bbdb1e96723?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=800&fit=crop"
    ],
    category: "Flowers",
    stock: 50
  },
  {
    name: "Black Forest Cake (1 Kg)",
    description: "Delicious chocolate layer cake with cherries, whipped cream frosting, and chocolate shavings. 100% Eggless available on request.",
    price: 159,
    images: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=800&fit=crop"
    ],
    category: "Cakes",
    stock: 20
  },
  {
    name: "Personalised Magic Mug",
    description: "Pour hot liquid and reveal your hidden photo! A perfect personalized gift that makes every morning special. High quality ceramic.",
    price: 49,
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=800&fit=crop"
    ],
    category: "Personalised Gifts",
    stock: 100
  },
  {
    name: "Ferrero Rocher Chocolate Bouquet",
    description: "16 pcs Ferrero Rocher arranged beautifully in golden wrapping. Because some love languages are sweet and luxurious.",
    price: 129,
    images: [
      "https://images.unsplash.com/photo-1511381939415-e440c9c36ba3?w=800&h=800&fit=crop"
    ],
    category: "Chocolates",
    stock: 30
  },
  {
    name: "Lucky Bamboo Plant - 2 Layer",
    description: "Bring good luck, prosperity, and positive energy with this low-maintenance indoor plant perfectly potted in a glass vase.",
    price: 69,
    images: [
      "https://images.unsplash.com/photo-1459156212016-c812468e2115?w=800&h=800&fit=crop"
    ],
    category: "Plants",
    stock: 45
  }
];

const seedData = async () => {
  try {
    // Attempt connection to MongoDB Atlas from .env
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aasanbuy';
    await mongoose.connect(uri);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Existing products cleared.');

    // Seed products
    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} Products Successfully Seeded!`);

    // Optional: Seed Settings if empty
    const settingsCount = await SiteSettings.countDocuments();
    if (settingsCount === 0) {
      await SiteSettings.create({
        heroBanner: {
          title: "Make Every Moment Special",
          subtitle: "Order premium flowers, delicious cakes, and personalized gifts in Qatar.",
          imageUrl: "https://images.unsplash.com/photo-1563241598-6bbdb1e96723"
        }
      });
      console.log('Default Site Settings Seeded!');
    }

    process.exit();
  } catch (err) {
    console.error('Data seeding failed:', err);
    process.exit(1);
  }
};

seedData();
