require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const SiteSettings = require('./models/SiteSettings');
const Category = require('./models/Category');
const Coupon = require('./models/Coupon');

const demoCategories = [
  { name: 'Flowers', image: 'https://images.unsplash.com/photo-1563241598-6bbdb1e96723?w=400&q=80' },
  { name: 'Luxe Cakes', image: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=400&q=80' },
  { name: 'Hampers', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80' },
  { name: 'Plants', image: 'https://images.unsplash.com/photo-1416879598555-21ff0ba82305?w=400&q=80' },
  { name: 'Personalized', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80' },
  { name: 'Combos', image: 'https://images.unsplash.com/photo-1530103862676-de889c25e24b?w=400&q=80' }
];

// Sample data with Unsplash images (AasanBuy style)
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

    await Category.deleteMany({});
    await Category.insertMany(demoCategories);
    console.log('6 Categories Successfully Seeded!');

    // Seed Welcome Coupon
    await Coupon.deleteMany({ code: 'NEWUSER10' });
    await Coupon.create({
      code: 'NEWUSER10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 0,
      isActive: true
    });
    console.log('Welcome Coupon (NEWUSER10) Seeded!');

    await SiteSettings.deleteMany({});
    await SiteSettings.create({
      heroBanners: [{
        title: "Make Every Moment Special",
        subtitle: "Order premium flowers, delicious cakes, and personalized gifts in Qatar.",
        imageUrl: "/hero_banner.png",
        linkUrl: "/products"
      }],
      navMenu: [
        { label: "Flowers" },
        { label: "Cakes" },
        { label: "Combos" },
        { label: "Gifts" }
      ],
      occasionSections: [
        {
          sectionTitle: "Celebrate With Us",
          occasions: [
            { label: "Birthday", imageUrl: "https://images.unsplash.com/photo-1530103862676-de889c25e24b?w=400&q=80", redirectUrl: "/products" },
            { label: "Anniversary", imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80", redirectUrl: "/products" },
            { label: "Valentine", imageUrl: "https://images.unsplash.com/photo-1563241598-6bbdb1e96723?w=400&q=80", redirectUrl: "/products" },
            { label: "Congratulations", imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80", redirectUrl: "/products" }
          ]
        }
      ],
      homeProductTabs: [
        {
          tabTitle: "Best Sellers",
          products: createdProducts.slice(0, 4).map((p, i) => ({
            product: p._id,
            tagLabel: i === 0 ? "Bestseller" : i === 1 ? "New Arrival" : "",
            tagColor: i === 0 ? "#EAB308" : "#EC4899"
          }))
        }
      ]
    });
    console.log('Default Site Settings Seeded!');

    process.exit();
  } catch (err) {
    console.error('Data seeding failed:', err);
    process.exit(1);
  }
};

seedData();
