require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

const products = [
  // Electronics
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise canceling headphones with 30-hour battery life, crystal clear hands-free calling, and exceptional sound quality with Auto NC Optimizer.',
    price: 349.99,
    originalPrice: 399.99,
    category: 'Electronics',
    brand: 'Sony',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600',
    ],
    stock: 45,
    tags: ['headphones', 'noise-canceling', 'wireless', 'audio', 'bluetooth'],
    rating: 4.8,
    numReviews: 234,
    isFeatured: true,
    views: 1520,
    purchases: 312,
  },
  {
    name: 'Apple MacBook Pro 14"',
    description: 'Supercharged by M3 Pro or M3 Max chip, MacBook Pro delivers exceptional performance for demanding workloads like video editing, 3D rendering, and ML model training.',
    price: 1999.99,
    originalPrice: 2199.99,
    category: 'Electronics',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
    ],
    stock: 20,
    tags: ['laptop', 'apple', 'macbook', 'computer', 'professional'],
    rating: 4.9,
    numReviews: 189,
    isFeatured: true,
    views: 2890,
    purchases: 178,
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: '200MP camera with AI-powered photography, titanium frame, integrated S Pen, 5000mAh battery with 45W charging. The ultimate Android flagship.',
    price: 1199.99,
    originalPrice: 1299.99,
    category: 'Electronics',
    brand: 'Samsung',
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600',
    ],
    stock: 35,
    tags: ['smartphone', 'samsung', 'android', 's-pen', 'camera'],
    rating: 4.7,
    numReviews: 312,
    isFeatured: true,
    views: 3200,
    purchases: 425,
  },
  {
    name: 'iPad Pro 12.9" M4',
    description: 'The ultimate iPad with M4 chip, Liquid Retina XDR display with nano-texture glass, Apple Pencil Pro support, and all-day battery life.',
    price: 1099.99,
    category: 'Electronics',
    brand: 'Apple',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'],
    stock: 25,
    tags: ['tablet', 'apple', 'ipad', 'drawing', 'creative'],
    rating: 4.8,
    numReviews: 145,
    views: 1800,
    purchases: 198,
  },
  {
    name: 'Canon EOS R6 Mark II',
    description: '40fps burst shooting, 4K 60p video, dual UHS-II card slots, 6.5-stop IBIS, and subject-tracking AF that detects people, animals, and vehicles.',
    price: 2499.99,
    originalPrice: 2699.99,
    category: 'Electronics',
    brand: 'Canon',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600'],
    stock: 12,
    tags: ['camera', 'dslr', 'mirrorless', 'photography', 'professional'],
    rating: 4.9,
    numReviews: 78,
    views: 980,
    purchases: 67,
  },
  // Fashion
  {
    name: 'Nike Air Max 270',
    description: 'Inspired by Air Max icons of the past, the Nike Air Max 270 features Nike\'s biggest heel Air unit yet for a super-soft ride that feels as good as it looks.',
    price: 149.99,
    originalPrice: 169.99,
    category: 'Fashion',
    brand: 'Nike',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
    stock: 80,
    tags: ['shoes', 'sneakers', 'nike', 'running', 'sportswear'],
    rating: 4.6,
    numReviews: 567,
    isFeatured: true,
    views: 4200,
    purchases: 890,
  },
  {
    name: 'Levi\'s 501 Original Jeans',
    description: 'The original jean since 1873. Button fly, straight leg, and a timeless look that goes with everything. Made with sustainable cotton.',
    price: 89.99,
    category: 'Fashion',
    brand: 'Levi\'s',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'],
    stock: 120,
    tags: ['jeans', 'denim', 'casual', 'pants', 'classic'],
    rating: 4.5,
    numReviews: 423,
    views: 2100,
    purchases: 567,
  },
  {
    name: 'Adidas Ultraboost 23',
    description: 'Responsive running shoes with Boost midsole technology, Primeknit+ upper, and Continental rubber outsole for superior grip in all weather conditions.',
    price: 189.99,
    originalPrice: 210.00,
    category: 'Fashion',
    brand: 'Adidas',
    images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600'],
    stock: 55,
    tags: ['shoes', 'running', 'adidas', 'boost', 'performance'],
    rating: 4.7,
    numReviews: 298,
    views: 1890,
    purchases: 412,
  },
  // Home & Garden
  {
    name: 'Dyson V15 Detect Vacuum',
    description: 'Laser Detect technology reveals hidden dust. Up to 60 min run time. Whole-machine filtration captures 99.99% of particles 0.3 microns in size.',
    price: 749.99,
    originalPrice: 799.99,
    category: 'Home & Garden',
    brand: 'Dyson',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
    stock: 30,
    tags: ['vacuum', 'cleaning', 'dyson', 'cordless', 'home'],
    rating: 4.7,
    numReviews: 234,
    isFeatured: true,
    views: 2100,
    purchases: 187,
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    description: 'Pressure cooker, slow cooker, rice cooker, steamer, sauté pan, food warmer, and sterilizer in one. 6-quart capacity feeds up to 6 people.',
    price: 99.99,
    originalPrice: 129.99,
    category: 'Home & Garden',
    brand: 'Instant Pot',
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'],
    stock: 65,
    tags: ['cooking', 'kitchen', 'pressure-cooker', 'appliance', 'home'],
    rating: 4.8,
    numReviews: 1234,
    views: 3400,
    purchases: 890,
  },
  // Sports
  {
    name: 'Peloton Bike+',
    description: 'The ultimate connected fitness experience. 23.8" rotating HD touchscreen, auto-follow resistance, and access to thousands of live and on-demand classes.',
    price: 2495.00,
    category: 'Sports',
    brand: 'Peloton',
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600'],
    stock: 8,
    tags: ['bike', 'fitness', 'cardio', 'indoor-cycling', 'workout'],
    rating: 4.6,
    numReviews: 89,
    isFeatured: true,
    views: 1200,
    purchases: 45,
  },
  {
    name: 'Garmin Forerunner 965',
    description: 'Premium running GPS watch with AMOLED display, full color maps, training readiness metric, and comprehensive training and recovery tools.',
    price: 599.99,
    category: 'Sports',
    brand: 'Garmin',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
    stock: 22,
    tags: ['watch', 'gps', 'running', 'fitness-tracker', 'smartwatch'],
    rating: 4.8,
    numReviews: 167,
    views: 1560,
    purchases: 134,
  },
  // Books
  {
    name: 'Atomic Habits by James Clear',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. #1 New York Times bestseller with over 10 million copies sold worldwide.',
    price: 18.99,
    category: 'Books',
    brand: 'Penguin Random House',
    images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600'],
    stock: 200,
    tags: ['self-help', 'habits', 'productivity', 'psychology', 'bestseller'],
    rating: 4.9,
    numReviews: 2345,
    views: 5600,
    purchases: 1890,
  },
  // Beauty
  {
    name: 'La Mer Moisturizing Cream',
    description: 'The legendary Crème de la Mer with miracle broth heals dryness and repairs the look of damage. Skin feels softer, stronger, more resilient.',
    price: 345.00,
    category: 'Beauty',
    brand: 'La Mer',
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'],
    stock: 40,
    tags: ['moisturizer', 'skincare', 'luxury', 'cream', 'anti-aging'],
    rating: 4.7,
    numReviews: 456,
    views: 2300,
    purchases: 234,
  },
];

const adminUser = {
  name: 'Admin User',
  email: 'admin@ecommerce.com',
  password: 'Admin@123456',
  role: 'admin',
};

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({ role: 'admin' });
    console.log('🗑️  Cleared existing products and admin users');

    // Create admin user
    const admin = await User.create(adminUser);
    console.log(`👤 Admin user created: ${admin.email}`);

    // Insert products — compute slugs manually then bulk insert
    const productsWithSlugs = products.map(p => ({
      ...p,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
    await Product.insertMany(productsWithSlugs);
    console.log(`📦 Seeded ${products.length} products`);

    console.log('\n✅ Database seeded successfully!');
    console.log('📧 Admin email: admin@ecommerce.com');
    console.log('🔑 Admin password: Admin@123456');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDB();
