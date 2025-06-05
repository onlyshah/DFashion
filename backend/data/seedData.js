const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Story = require('../models/Story');
const Post = require('../models/Post');
require('dotenv').config();

// Sample users data
const sampleUsers = [
  {
    username: 'fashionista_maya',
    email: 'maya@example.com',
    password: 'password123',
    fullName: 'Maya Sharma',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    bio: 'Fashion enthusiast | Style blogger | Love ethnic wear ✨',
    followers: [],
    following: [],
    socialStats: { postsCount: 12, followersCount: 1250, followingCount: 890 }
  },
  {
    username: 'style_guru_raj',
    email: 'raj@example.com',
    password: 'password123',
    fullName: 'Raj Patel',
    role: 'vendor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Premium menswear designer | Crafting style since 2015 👔',
    vendorInfo: {
      businessName: 'StyleCraft Menswear',
      businessType: 'Fashion Designer',
      isApproved: true
    },
    socialStats: { postsCount: 45, followersCount: 5600, followingCount: 234 }
  },
  {
    username: 'trendy_priya',
    email: 'priya@example.com',
    password: 'password123',
    fullName: 'Priya Singh',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    bio: 'Mom of 2 | Fashion on budget | Sustainable fashion advocate 🌱',
    socialStats: { postsCount: 28, followersCount: 890, followingCount: 456 }
  },
  {
    username: 'ethnic_elegance',
    email: 'vendor@example.com',
    password: 'password123',
    fullName: 'Anita Desai',
    role: 'vendor',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    bio: 'Traditional Indian wear | Handcrafted with love | Worldwide shipping 🇮🇳',
    vendorInfo: {
      businessName: 'Ethnic Elegance',
      businessType: 'Traditional Wear',
      isApproved: true
    },
    socialStats: { postsCount: 67, followersCount: 8900, followingCount: 123 }
  }
];

// Sample products data
const sampleProducts = [
  {
    name: 'Floral Print Maxi Dress',
    description: 'Beautiful floral print maxi dress perfect for summer occasions. Made with breathable cotton fabric.',
    price: 2499,
    originalPrice: 3499,
    discount: 29,
    category: 'women',
    subcategory: 'dresses',
    brand: 'StyleCraft',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500',
        alt: 'Floral maxi dress front view',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1566479179817-c0b5b4b8b1cc?w=500',
        alt: 'Floral maxi dress side view'
      }
    ],
    sizes: [
      { size: 'S', stock: 15 },
      { size: 'M', stock: 20 },
      { size: 'L', stock: 12 },
      { size: 'XL', stock: 8 }
    ],
    colors: [
      { name: 'Blue Floral', code: '#4A90E2' },
      { name: 'Pink Floral', code: '#F5A623' }
    ],
    tags: ['summer', 'casual', 'floral', 'maxi'],
    material: '100% Cotton',
    rating: { average: 4.5, count: 89 },
    analytics: { views: 1250, likes: 89, shares: 23, purchases: 45 }
  },
  {
    name: 'Classic White Shirt',
    description: 'Crisp white formal shirt for men. Perfect for office wear and formal occasions.',
    price: 1899,
    originalPrice: 2299,
    discount: 17,
    category: 'men',
    subcategory: 'shirts',
    brand: 'StyleCraft',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
        alt: 'White formal shirt',
        isPrimary: true
      }
    ],
    sizes: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 25 },
      { size: 'L', stock: 18 },
      { size: 'XL', stock: 12 },
      { size: 'XXL', stock: 5 }
    ],
    colors: [
      { name: 'White', code: '#FFFFFF' }
    ],
    tags: ['formal', 'office', 'classic', 'cotton'],
    material: 'Cotton Blend',
    rating: { average: 4.3, count: 156 },
    analytics: { views: 2100, likes: 156, shares: 45, purchases: 78 }
  },
  {
    name: 'Ethnic Kurti Set',
    description: 'Traditional Indian kurti with palazzo pants. Perfect for festivals and casual wear.',
    price: 3299,
    originalPrice: 4599,
    discount: 28,
    category: 'women',
    subcategory: 'ethnic',
    brand: 'Ethnic Elegance',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500',
        alt: 'Ethnic kurti set',
        isPrimary: true
      }
    ],
    sizes: [
      { size: 'S', stock: 8 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 12 },
      { size: 'XL', stock: 6 }
    ],
    colors: [
      { name: 'Royal Blue', code: '#4169E1' },
      { name: 'Maroon', code: '#800000' }
    ],
    tags: ['ethnic', 'traditional', 'festival', 'kurti'],
    material: 'Cotton Silk',
    rating: { average: 4.7, count: 234 },
    analytics: { views: 3400, likes: 234, shares: 67, purchases: 123 }
  }
];

// Sample stories data
const sampleStories = [
  {
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400'
    },
    caption: 'Perfect outfit for brunch! 🥐☕',
    products: [
      {
        position: { x: 30, y: 60 },
        size: 'M',
        color: 'Blue Floral'
      }
    ],
    analytics: { views: 450, likes: 89, shares: 12, productClicks: 23, purchases: 5 }
  }
];

// Sample posts data
const samplePosts = [
  {
    caption: 'Loving this new floral dress! Perfect for the summer vibes 🌸 #SummerFashion #FloralDress #OOTD',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600',
        alt: 'Summer floral dress outfit'
      }
    ],
    products: [
      {
        position: { x: 40, y: 50 },
        size: 'M',
        color: 'Blue Floral'
      }
    ],
    hashtags: ['SummerFashion', 'FloralDress', 'OOTD', 'StyleInspo'],
    analytics: { views: 1250, likes: 189, comments: 23, shares: 45, saves: 67, productClicks: 89, purchases: 12 }
  }
];

module.exports = {
  sampleUsers,
  sampleProducts,
  sampleStories,
  samplePosts
};
