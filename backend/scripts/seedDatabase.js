const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Story = require('../models/Story');
const Post = require('../models/Post');
const { sampleUsers, sampleProducts, sampleStories, samplePosts } = require('../data/seedData');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dfashion');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Story.deleteMany({});
    await Post.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
    }
    console.log('Created sample users');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@dfashion.com',
      password: 'admin123',
      fullName: 'Admin User',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      bio: 'DFashion Platform Administrator'
    });
    await adminUser.save();
    users.push(adminUser);
    console.log('Created admin user');

    // Create products
    const products = [];
    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = {
        ...sampleProducts[i],
        vendor: users[i % 2 === 0 ? 1 : 3]._id // Assign to vendors (index 1 and 3)
      };
      const product = new Product(productData);
      await product.save();
      products.push(product);
    }
    console.log('Created sample products');

    // Create more products for better visualization
    const additionalProducts = [
      {
        name: 'Denim Jacket',
        description: 'Classic blue denim jacket for casual wear',
        price: 2999,
        originalPrice: 3999,
        discount: 25,
        category: 'men',
        subcategory: 'jackets',
        brand: 'StyleCraft',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
            alt: 'Denim jacket',
            isPrimary: true
          }
        ],
        sizes: [
          { size: 'M', stock: 15 },
          { size: 'L', stock: 20 },
          { size: 'XL', stock: 10 }
        ],
        colors: [{ name: 'Blue', code: '#4169E1' }],
        vendor: users[1]._id,
        tags: ['casual', 'denim', 'jacket'],
        material: 'Cotton Denim',
        rating: { average: 4.2, count: 67 },
        analytics: { views: 890, likes: 67, shares: 15, purchases: 23 }
      },
      {
        name: 'Summer Crop Top',
        description: 'Trendy crop top perfect for summer outings',
        price: 1299,
        originalPrice: 1799,
        discount: 28,
        category: 'women',
        subcategory: 'tops',
        brand: 'Ethnic Elegance',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1564257577-2d3b9b2c1e8b?w=500',
            alt: 'Summer crop top',
            isPrimary: true
          }
        ],
        sizes: [
          { size: 'S', stock: 20 },
          { size: 'M', stock: 25 },
          { size: 'L', stock: 15 }
        ],
        colors: [
          { name: 'Pink', code: '#FF69B4' },
          { name: 'White', code: '#FFFFFF' }
        ],
        vendor: users[3]._id,
        tags: ['summer', 'crop', 'trendy'],
        material: 'Cotton Blend',
        rating: { average: 4.6, count: 123 },
        analytics: { views: 1560, likes: 123, shares: 34, purchases: 67 }
      }
    ];

    for (const productData of additionalProducts) {
      const product = new Product(productData);
      await product.save();
      products.push(product);
    }

    // Create stories
    for (let i = 0; i < sampleStories.length; i++) {
      const storyData = {
        ...sampleStories[i],
        user: users[i]._id,
        products: [{
          ...sampleStories[i].products[0],
          product: products[0]._id
        }]
      };
      const story = new Story(storyData);
      await story.save();
    }
    console.log('Created sample stories');

    // Create posts
    for (let i = 0; i < samplePosts.length; i++) {
      const postData = {
        ...samplePosts[i],
        user: users[i]._id,
        products: [{
          ...samplePosts[i].products[0],
          product: products[0]._id
        }]
      };
      const post = new Post(postData);
      await post.save();
    }
    console.log('Created sample posts');

    // Set up follow relationships
    users[0].following.push(users[1]._id, users[2]._id);
    users[0].socialStats.followingCount = 2;
    users[1].followers.push(users[0]._id);
    users[1].socialStats.followersCount += 1;
    users[2].followers.push(users[0]._id);
    users[2].socialStats.followersCount += 1;

    await users[0].save();
    await users[1].save();
    await users[2].save();

    console.log('Database seeded successfully!');
    console.log('\nSample accounts created:');
    console.log('Admin: admin@dfashion.com / admin123');
    console.log('Customer: maya@example.com / password123');
    console.log('Vendor: raj@example.com / password123');
    console.log('Customer: priya@example.com / password123');
    console.log('Vendor: vendor@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
